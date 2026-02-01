param(
  [int]$LoopSleepSeconds = 60,
  [int]$FailSleepSeconds = 300,
  [switch]$CreateGitHubIssue
)

Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Write-Stamp($msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$ts] $msg"
}

function Run-Cmd([string]$exe, [string[]]$args) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $exe
  $psi.Arguments = ($args -join " ")
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true

  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi
  [void]$p.Start()
  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  $p.WaitForExit()

  return [pscustomobject]@{
    ExitCode = $p.ExitCode
    Stdout = $stdout
    Stderr = $stderr
    All = ($stdout + "`n" + $stderr)
  }
}

function Capture-D8TV-Snippet([string]$repoRoot, [string]$outFile) {
  $path = Join-Path $repoRoot "src/app/_client/D8TV.tsx"
  if (!(Test-Path $path)) { return }

  $lines = Get-Content $path
  $start = 150
  $end   = [Math]::Min(260, $lines.Count)

  "=== D8TV.tsx lines $start-$end ===" | Out-File -FilePath $outFile -Encoding utf8 -Append
  for ($i=$start; $i -le $end; $i++) {
    "{0,4}: {1}" -f $i, $lines[$i-1] | Out-File -FilePath $outFile -Encoding utf8 -Append
  }

  $raw = Get-Content $path -Raw
  "" | Out-File -FilePath $outFile -Encoding utf8 -Append
  "=== QUICK CHECKS ===" | Out-File -FilePath $outFile -Encoding utf8 -Append

  $bt = ([regex]::Matches($raw, "`"")).Count
  "Backtick (`) count: $bt" | Out-File -FilePath $outFile -Encoding utf8 -Append
  if (($bt % 2) -ne 0) { "WARNING: odd number of backticks (broken template literal likely)" | Out-File -FilePath $outFile -Encoding utf8 -Append }

  if ($raw -match "``") {
    "WARNING: found double backticks (``)" | Out-File -FilePath $outFile -Encoding utf8 -Append
    (Select-String -Path $path -Pattern "``" | ForEach-Object { "$($_.LineNumber): $($_.Line)" }) |
      Out-File -FilePath $outFile -Encoding utf8 -Append
  }
}

function Maybe-Create-Issue([string]$title, [string]$bodyPath) {
  if (!(Get-Command gh -ErrorAction SilentlyContinue)) { return }
  $body = Get-Content $bodyPath -Raw
  # Keep body manageable; truncate if huge
  if ($body.Length -gt 12000) { $body = $body.Substring(0,12000) + "`n...(truncated)" }
  Run-Cmd "gh" @("issue","create","--title",$title,"--body",$body) | Out-Null
}

# Ensure logs folder
$repoRoot = (Get-Location).Path
$logDir = Join-Path $repoRoot "_auto_logs"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

Write-Stamp "AUTO_WATCH_BUILD starting in: $repoRoot"
Write-Stamp "LoopSleepSeconds=$LoopSleepSeconds FailSleepSeconds=$FailSleepSeconds CreateGitHubIssue=$CreateGitHubIssue"

$lastSha = ""

while ($true) {
  try {
    # Pull latest
    Write-Stamp "git fetch"
    Run-Cmd "git" @("fetch","origin","main") | Out-Null

    $sha = (Run-Cmd "git" @("rev-parse","origin/main")).Stdout.Trim()
    if ([string]::IsNullOrWhiteSpace($sha)) { throw "Could not resolve origin/main SHA" }

    if ($sha -ne $lastSha) {
      Write-Stamp "New SHA detected: $sha (previous: $lastSha)"
      $lastSha = $sha

      Write-Stamp "git reset --hard origin/main"
      Run-Cmd "git" @("reset","--hard","origin/main") | Out-Null

      # Build
      $ts = Get-Date -Format "yyyyMMdd_HHmmss"
      $logBase = Join-Path $logDir "build_$ts"
      $buildLog = "$logBase.log"
      $snipLog  = "$logBase.snip.txt"

      Write-Stamp "npm ci"
      $ci = Run-Cmd "npm" @("ci")
      $ci.All | Out-File -FilePath $buildLog -Encoding utf8

      Write-Stamp "npm run build"
      $b = Run-Cmd "npm" @("run","build")
      $b.All | Out-File -FilePath $buildLog -Encoding utf8 -Append

      if ($b.ExitCode -ne 0) {
        Write-Stamp "BUILD FAILED. Capturing snippet to: $snipLog"
        Capture-D8TV-Snippet $repoRoot $snipLog

        if ($CreateGitHubIssue) {
          $title = "auto: build failed on $sha"
          Write-Stamp "Creating GitHub issue: $title"
          Maybe-Create-Issue $title $snipLog
        }

        Write-Stamp "Sleeping FailSleepSeconds=$FailSleepSeconds"
        Start-Sleep -Seconds $FailSleepSeconds
        continue
      }

      Write-Stamp "BUILD OK for $sha"
    }

    Start-Sleep -Seconds $LoopSleepSeconds
  }
  catch {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $errPath = Join-Path $logDir "watcher_error_$ts.txt"
    $_ | Out-String | Out-File -FilePath $errPath -Encoding utf8
    Write-Stamp "WATCHER ERROR. Logged: $errPath"
    Start-Sleep -Seconds $FailSleepSeconds
  }
}
