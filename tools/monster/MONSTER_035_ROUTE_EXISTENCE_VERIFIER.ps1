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
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Write-Host "=== ROUTE EXISTENCE VERIFIER ===" -ForegroundColor Cyan
Write-Host ("RepoRoot: " + $RepoRoot)

$needles = @(
  "src\app\api\tv\status\route.ts",
  "src\app\api\tv\health\route.ts",
  "src\app\api\tv\ping\route.ts",
  "src\app\api\io\health\route.ts",
  "src\app\tv\page.tsx"
)

$found = 0
foreach ($rel in $needles) {
  $p = Join-Path $RepoRoot $rel
  if (Test-Path -LiteralPath $p) {
    Ok ("FOUND: " + $rel)
    $found++
  } else {
    Warn ("MISSING: " + $rel)
  }
}

Write-Host ""
Write-Host "Quick scan: any route.ts under src\app\api ?" -ForegroundColor Cyan
$apiRoot = Join-Path $RepoRoot "src\app\api"
if (Test-Path -LiteralPath $apiRoot) {
  Get-ChildItem -LiteralPath $apiRoot -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq "route.ts" -or $_.Name -eq "route.js" } |
    Select-Object FullName |
    ForEach-Object { Write-Host $_.FullName }
} else {
  Warn "src\app\api not found (this repo may not be App Router layout)."
}

Write-Host ""
Ok ("Needles found: {0}/{1}" -f $found, $needles.Count)
