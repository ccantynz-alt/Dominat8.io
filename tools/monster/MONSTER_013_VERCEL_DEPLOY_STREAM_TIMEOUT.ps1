Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = "",
  [Parameter(Mandatory=$false)][int]$MaxSeconds = 300
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Ok ("RepoRoot: {0}" -f $RepoRoot)

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

$handlerOut = [System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } }
$handlerErr = [System.Diagnostics.DataReceivedEventHandler]{ param($s,$e) if ($e.Data) { Write-Host $e.Data } }
$p.add_OutputDataReceived($handlerOut)
$p.add_ErrorDataReceived($handlerErr)

Ok "Starting: vercel --prod --force"
[void]$p.Start()
$p.BeginOutputReadLine()
$p.BeginErrorReadLine()

$sw = [System.Diagnostics.Stopwatch]::StartNew()
while (-not $p.HasExited) {
  Start-Sleep -Milliseconds 200
  if ($sw.Elapsed.TotalSeconds -ge $MaxSeconds) {
    Warn ("Timeout reached ({0}s). Killing process..." -f $MaxSeconds)
    try { $p.Kill() } catch {}
    Fail "Deploy timed out."
  }
}

$code = $p.ExitCode
if ($code -eq 0) { Ok "Deploy exited 0" } else { Fail ("Deploy failed exit code: {0}" -f $code) }
