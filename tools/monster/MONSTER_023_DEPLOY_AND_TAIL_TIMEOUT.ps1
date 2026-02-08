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

function Get-ArgValue([string]$Name,[string]$Default){
  # Accepts -Name Value pairs from $args (case-insensitive)
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

$RepoRoot   = Get-ArgValue "RepoRoot" (Get-Location).Path
$MaxSeconds = [int](Get-ArgValue "MaxSeconds" "300")

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Ok ("RepoRoot: {0}" -f $RepoRoot)
Ok ("MaxSeconds: {0}" -f $MaxSeconds)

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

Ok "Starting deploy: vercel --prod --force"
[void]$p.Start()
$p.BeginOutputReadLine()
$p.BeginErrorReadLine()

$sw = [System.Diagnostics.Stopwatch]::StartNew()
while (-not $p.HasExited) {
  Start-Sleep -Milliseconds 200
  if ($sw.Elapsed.TotalSeconds -ge $MaxSeconds) {
    Warn ("Timeout {0}s reached. Killing deploy process." -f $MaxSeconds)
    try { $p.Kill() } catch {}
    Fail "Deploy timed out."
  }
}

if ($p.ExitCode -eq 0) { Ok "Deploy exit 0" } else { Fail ("Deploy exit " + $p.ExitCode) }
