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

Write-Host ""
$Domain = Get-ArgValue "Domain" "dominat8.io"
$ExpectedProject = Get-ArgValue "ExpectedProjectHint" "dominat8io"

Write-Host "=== DOMAIN MOVE CHECKLIST ===" -ForegroundColor Cyan
Write-Host ("Domain: {0}" -f $Domain)
Write-Host ("Expected Project Hint: {0}" -f $ExpectedProject)
Write-Host ""
Write-Host "A) Vercel Dashboard steps (do once):" -ForegroundColor Yellow
Write-Host "   1) Vercel → Domains → search the domain"
Write-Host "   2) Open current owning project → Settings → Domains → remove it"
Write-Host "   3) Open target project (dominat8io) → Settings → Domains → add it"
Write-Host ""
Write-Host "B) Local proof (run after moving domain):" -ForegroundColor Yellow
Write-Host ("   vercel domains inspect {0}" -f $Domain)
Write-Host ""
Write-Host "C) Cockpit probe:" -ForegroundColor Yellow
Write-Host ("   $ts = [int][double]::Parse((Get-Date -UFormat %s)); curl.exe -s ""https://{0}/api/tv/status?ts=$ts""" -f $Domain)
Write-Host ""
Write-Host "Running: vercel domains inspect (best-effort)..." -ForegroundColor Cyan
try {
  $out = cmd /c ("vercel domains inspect " + $Domain) 2^>^&1
  $text = ($out | Out-String)
  Write-Host $text
  if ($text -match [regex]::Escape($ExpectedProject)) { Ok ("Looks attached to: " + $ExpectedProject) } else { Warn ("Project hint not found: " + $ExpectedProject) }
} catch {
  Warn ("vercel inspect failed: " + $_.Exception.Message)
}
