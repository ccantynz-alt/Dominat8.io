Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io",
  [Parameter(Mandatory=$false)][string]$ExpectedProjectHint = "dominat8io",
  [Parameter(Mandatory=$false)][string]$OutDir = ""
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Text([string]$Path,[string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) { $OutDir = Join-Path $env:TEMP "D8_EVIDENCE" }
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("VERCEL_TRIAGE_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Out: {0}" -f $dir)

$cmds = @(
  ("vercel --version"),
  ("vercel whoami"),
  ("vercel domains inspect " + $Domain)
)

foreach ($c in $cmds) {
  $safe = ($c -replace "[^\w\-]+","_").Trim("_")
  $p = Join-Path $dir ("{0}.txt" -f $safe)
  Write-Host ("--- " + $c) -ForegroundColor Cyan
  try {
    $out = cmd /c $c 2^>^&1
    $text = ($out | Out-String)
    Write-Host $text
    Write-Text $p $text
  } catch {
    $msg = "ERR " + $_.Exception.Message
    Write-Host $msg
    Write-Text $p $msg
  }
}

$inspectPath = Join-Path $dir ("vercel_domains_inspect_{0}.txt" -f ($Domain -replace "[^\w\-\.]+","_"))
if (Test-Path -LiteralPath $inspectPath) {
  $t = Get-Content -LiteralPath $inspectPath -Raw
  if ($t -match [regex]::Escape($ExpectedProjectHint)) {
    Ok ("Project hint appears: {0}" -f $ExpectedProjectHint)
  } else {
    Warn ("Project hint NOT found: {0}. Likely attached to another Vercel project." -f $ExpectedProjectHint)
    Warn "Action: Vercel Dashboard → Domains → move domain to the correct project."
  }
} else {
  Warn "No inspect output file found (unexpected). Check vercel CLI."
}

Write-Host $dir
