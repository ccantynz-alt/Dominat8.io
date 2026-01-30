# UPGRADE_2026-01-31_FIX_D8SECTION_TONE_PROP.ps1
# Adds `tone` to D8SectionProps so marketing pages compile cleanly

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function Backup($p){
  if (!(Test-Path -LiteralPath $p)) { Fail "Missing file: $p" }
  $bak = "$p.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"
  Copy-Item -LiteralPath $p -Destination $bak -Force
  Ok "Backup: $bak"
}

function WriteNoBom($p,$c){
  [IO.File]::WriteAllText($p,$c,(New-Object Text.UTF8Encoding $false))
}

$path = "src/ui/sections/SectionShell.tsx"
Backup $path

$src = Get-Content -LiteralPath $path -Raw

# 1) Ensure tone is defined in props
$src = $src -replace 'export type D8SectionProps\s*=\s*\{',
@"
export type D8SectionProps = {
  tone?: 'default' | 'glass' | 'dark';
"@

# 2) Ensure tone is destructured with default
$src = $src -replace 'function D8Section\s*\(\s*\{',
@"
function D8Section({
  tone = 'default',
"@

# 3) Apply tone styling (non-breaking)
$src = $src -replace 'const shellStyle\s*=\s*\{',
@"
const shellStyle = {
  ...(tone === 'glass' ? {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.08)'
  } : {}),
"@

WriteNoBom $path $src
Ok "Added tone support to D8Section"

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""feat(ui): add tone support to D8Section""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
