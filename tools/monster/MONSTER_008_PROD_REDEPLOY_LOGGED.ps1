#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot   = 'C:\Temp\FARMS\Dominat8.io-clone'
  [Parameter(Mandatory=$false)][int]$MaxSeconds   = 240
)

function Ok([string]$m){ Write-Host ('OK   ' + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ('WARN ' + $m) -ForegroundColor Yellow }
function Fail([string]$m){ Write-Host ('FATAL ' + $m) -ForegroundColor Red; throw $m }

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot '.git'))) { Fail ('Not a repo: ' + $RepoRoot) }

$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) { Fail 'Vercel CLI not found in PATH' }

$logDir = Join-Path $RepoRoot 'tools\monster\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$log = Join-Path $logDir ('vercel_prod_' + $stamp + '.log')

Ok ('RepoRoot = ' + (git -C $RepoRoot rev-parse --show-toplevel))
Ok ('Log     = ' + $log)
Ok 'Running: vercel --prod --force (timeout protected)'
Write-Host ''

Push-Location -LiteralPath $RepoRoot
try {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'cmd.exe'
  $psi.Arguments = '/c vercel --prod --force'
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError  = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true

  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi
  $null = $p.Start()

  $sw = [Diagnostics.Stopwatch]::StartNew()
  while (-not $p.HasExited) {
    Start-Sleep -Milliseconds 250
    if ($sw.Elapsed.TotalSeconds -ge $MaxSeconds) {
      Warn ('Timeout hit (' + $MaxSeconds + 's). Killing vercel...')
      try { $p.Kill() } catch {}
      break
    }
  }

  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($log, ($stdout + "
" + $stderr), $utf8NoBom)

  Write-Host $stdout
  if ($stderr) { Write-Host $stderr -ForegroundColor DarkYellow }

  Write-Host ''
  Ok 'If Aliased: https://dominat8.io is missing, domain is attached to another Vercel project.'
}
finally { Pop-Location }

Write-Host ''
Ok 'Done.'