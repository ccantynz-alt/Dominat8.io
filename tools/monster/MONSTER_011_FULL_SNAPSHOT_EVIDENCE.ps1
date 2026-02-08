Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$RepoRoot = "",
  [Parameter(Mandatory=$false)][string]$Repo = "",
  [Parameter(Mandatory=$false)][string]$Domain = "",
  [Parameter(Mandatory=$false)][string]$OutDir = ""
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }

if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $env:TEMP "D8_EVIDENCE" }
Ensure-Dir $OutDir

$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("EVIDENCE_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Evidence dir: {0}" -f $dir)

function Write-Text([string]$name, [string]$text){
  $p = Join-Path $dir $name
  [System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding($false)))
  Ok ("Wrote: {0}" -f $p)
}

Push-Location -LiteralPath $RepoRoot
try {
  Write-Text "01_where.txt" (Get-Location).Path
  Write-Text "02_git_status.txt" (git status --porcelain | Out-String)
  Write-Text "03_git_head.txt" (("HEAD=" + (git rev-parse HEAD)) + "`r`n" + ("BRANCH=" + (git rev-parse --abbrev-ref HEAD)) + "`r`n")

  if (-not [string]::IsNullOrWhiteSpace($Domain)) {
    $ts = [int][double]::Parse((Get-Date -UFormat %s))
    $u1 = ("https://{0}/api/tv/status?ts={1}" -f $Domain, $ts)
    $u2 = ("https://{0}/api/io/health?ts={1}" -f $Domain, $ts)
    $r = @()
    $r += ("GET " + $u1)
    try { $r += (curl.exe -s -D - --max-time 25 $u1) } catch { $r += ("ERR " + $_.Exception.Message) }
    $r += ""
    $r += ("GET " + $u2)
    try { $r += (curl.exe -s -D - --max-time 25 $u2) } catch { $r += ("ERR " + $_.Exception.Message) }
    Write-Text "04_http_probes.txt" ($r -join "`r`n")
  } else {
    Warn "Domain not provided; skipping HTTP probes."
  }

  # Vercel domain inspect (best-effort)
  if (-not [string]::IsNullOrWhiteSpace($Domain)) {
    $out = @()
    $out += ("vercel domains inspect " + $Domain)
    try { $out += (cmd /c ("vercel domains inspect " + $Domain) 2^>^&1) } catch { $out += ("ERR " + $_.Exception.Message) }
    Write-Text "05_vercel_domains_inspect.txt" ($out -join "`r`n")
  }

  # GitHub workflow list (best-effort)
  if (-not [string]::IsNullOrWhiteSpace($Repo)) {
    $out = @()
    $out += ("gh workflow list -R " + $Repo)
    try { $out += (gh workflow list -R $Repo 2>&1 | Out-String) } catch { $out += ("ERR " + $_.Exception.Message) }
    Write-Text "06_gh_workflow_list.txt" ($out -join "`r`n")
  }

  Ok "Snapshot evidence complete."
} finally {
  Pop-Location
}

Write-Host $dir
