Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}
function Append-Utf8NoBom([string]$Path, [string]$Content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::AppendAllText($Path, $Content, $utf8NoBom)
}

function Run-Native([string]$Label, [scriptblock]$Sb) {
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $out = & $Sb 2>&1
    $code = $LASTEXITCODE
    return [pscustomobject]@{ Output = @($out); ExitCode = $code; Label = $Label }
  }
  finally { $ErrorActionPreference = $old }
}

# ---- repo root = current directory ----
$RepoRoot = (Get-Location).Path
Info "RepoRoot (PWD): $RepoRoot"
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot "package.json"))) { Fail "package.json missing in PWD. cd into repo root first." }

try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

$stamp = "D8_IO_LINK_DIAG_024_{0}" -f (Get-Date -Format "yyyyMMdd_HHmmss")
$log = Join-Path $RepoRoot ("LINK_DIAG_024_{0}.txt" -f $stamp)

Write-Utf8NoBom $log ("=== LINK DIAG 024 ({0}) ===`r`nRepo: {1}`r`nNow: {2}`r`n`r`n" -f $stamp, $RepoRoot, (Get-Date).ToString("o"))
Ok "Writing log: $log"

Append-Utf8NoBom $log "=== vercel --version ===`r`n"
$ver = Run-Native "vercel --version" { vercel --version }
Append-Utf8NoBom $log ( ($ver.Output -join "`r`n") + "`r`nEXIT=$($ver.ExitCode)`r`n`r`n" )

Append-Utf8NoBom $log "=== vercel whoami ===`r`n"
$who = Run-Native "vercel whoami" { vercel whoami }
Append-Utf8NoBom $log ( ($who.Output -join "`r`n") + "`r`nEXIT=$($who.ExitCode)`r`n`r`n" )

Append-Utf8NoBom $log "=== vercel link --yes ===`r`n"
$link = Run-Native "vercel link --yes" { vercel link --yes }
Append-Utf8NoBom $log ( ($link.Output -join "`r`n") + "`r`nEXIT=$($link.ExitCode)`r`n`r`n" )

Append-Utf8NoBom $log "=== vercel project ls ===`r`n"
$pls = Run-Native "vercel project ls" { vercel project ls }
Append-Utf8NoBom $log ( ($pls.Output -join "`r`n") + "`r`nEXIT=$($pls.ExitCode)`r`n`r`n" )

Append-Utf8NoBom $log "=== vercel env ls (optional) ===`r`n"
$els = Run-Native "vercel env ls" { vercel env ls }
Append-Utf8NoBom $log ( ($els.Output -join "`r`n") + "`r`nEXIT=$($els.ExitCode)`r`n`r`n" )

Ok "DONE. Open and paste back ONLY the 'vercel link --yes' block (including EXIT=...)."
Write-Host "OPEN:" -ForegroundColor Yellow
Write-Host "  notepad `"$log`"" -ForegroundColor Yellow
Start-Process notepad.exe -ArgumentList @($log)
