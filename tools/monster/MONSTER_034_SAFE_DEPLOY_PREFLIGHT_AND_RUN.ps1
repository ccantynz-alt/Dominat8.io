Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Text([string]$Path,[string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}
function Read-Text([string]$Path){ return [System.IO.File]::ReadAllText($Path) }

function Get-ArgValue([string]$Name,[string]$Default){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) {
      if (($i + 1) -lt $args.Count) { return [string]$args[$i+1] }
      return $Default
    }
  }
  return $Default
}
function Has-Switch([string]$Name){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) { return $true }
  }
  return $false
}

function NowUnix { return [int][double]::Parse((Get-Date -UFormat %s)) }
$RepoRoot = Get-ArgValue "RepoRoot" (Get-Location).Path
$MaxSeconds = [int](Get-ArgValue "MaxSeconds" "600")
$Force = Has-Switch "Force"

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Write-Host "=== SAFE DEPLOY PREFLIGHT ===" -ForegroundColor Cyan
Write-Host ("RepoRoot: " + $RepoRoot)
Write-Host ("MaxSeconds: " + $MaxSeconds + "  Force: " + $Force)

Push-Location -LiteralPath $RepoRoot
try {
  $porc = (git status --porcelain | Out-String).Trim()
  if (-not $Force) {
    if (-not [string]::IsNullOrWhiteSpace($porc)) {
      Warn "Working tree not clean:"
      Write-Host $porc
      Fail "Refusing deploy. Commit/stash or rerun with -Force."
    }
  } else {
    if (-not [string]::IsNullOrWhiteSpace($porc)) { Warn "Working tree dirty but -Force set. Continuing." }
  }

  Write-Host ""
  Write-Host "Vercel whoami:" -ForegroundColor Cyan
  try { cmd /c "vercel whoami" | Out-Host } catch { Warn ("vercel whoami failed: " + $_.Exception.Message) }

  Write-Host ""
  Write-Host "Starting deploy: vercel --prod --force" -ForegroundColor Cyan
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "cmd.exe"
  $psi.Arguments = "/c vercel --prod --force"
  $psi.WorkingDirectory = $RepoRoot
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.CreateNoWindow = $true
  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi
  $p.add_OutputDataReceived([System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } })
  $p.add_ErrorDataReceived([System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } })
  [void]$p.Start()
  $p.BeginOutputReadLine()
  $p.BeginErrorReadLine()
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while (-not $p.HasExited) {
    Start-Sleep -Milliseconds 250
    if ($sw.Elapsed.TotalSeconds -ge $MaxSeconds) {
      Warn ("Timeout {0}s reached. Killing deploy." -f $MaxSeconds)
      try { $p.Kill() } catch {}
      Fail "Deploy timed out."
    }
  }
  if ($p.ExitCode -eq 0) { Ok "Deploy exit 0" } else { Fail ("Deploy exit " + $p.ExitCode) }
} finally { Pop-Location }
