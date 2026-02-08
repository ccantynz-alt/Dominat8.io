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

$RepoRoot = Get-ArgValue "RepoRoot" (Get-Location).Path
$Domain   = Get-ArgValue "Domain" "dominat8.io"
$OutDir   = Get-ArgValue "OutDir" (Join-Path $env:TEMP "D8_EVIDENCE")

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("SNAP_022_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Evidence: {0}" -f $dir)

Write-Text (Join-Path $dir "00_where.txt") $RepoRoot
Push-Location -LiteralPath $RepoRoot
try {
  Write-Text (Join-Path $dir "01_git_status.txt") ((git status --porcelain | Out-String))
  Write-Text (Join-Path $dir "02_git_head.txt") (("HEAD=" + (git rev-parse HEAD)) + "`r`n" + ("BRANCH=" + (git rev-parse --abbrev-ref HEAD)) + "`r`n")
} finally { Pop-Location }

try {
  $out = cmd /c "vercel --version" 2^>^&1
  Write-Text (Join-Path $dir "03_vercel_version.txt") (($out | Out-String))
} catch {}

try {
  $out = cmd /c "vercel whoami" 2^>^&1
  Write-Text (Join-Path $dir "04_vercel_whoami.txt") (($out | Out-String))
} catch {}

try {
  $out = cmd /c ("vercel domains inspect " + $Domain) 2^>^&1
  Write-Text (Join-Path $dir "05_vercel_domains_inspect.txt") (($out | Out-String))
} catch { Write-Text (Join-Path $dir "05_vercel_domains_inspect.txt") ("ERR " + $_.Exception.Message) }

$ts = [int][double]::Parse((Get-Date -UFormat %s))
$u = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)
try {
  $resp = (curl.exe -s -D - --max-time 25 $u) -join "`r`n"
  Write-Text (Join-Path $dir "06_tv_status.txt") $resp
} catch { Write-Text (Join-Path $dir "06_tv_status.txt") ("ERR " + $_.Exception.Message) }

Write-Host $dir
