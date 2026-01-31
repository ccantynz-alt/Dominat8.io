# UPGRADE_2026-01-31_FIX_FALLBACKSTYLES_TEMPLATE_LITERAL.ps1
# Fixes src/app/_client/FallbackStyles.tsx where raw CSS was pasted after `const css =`
# by wrapping the CSS block in a template literal (`...`).

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

$path = "src/app/_client/FallbackStyles.tsx"
Backup $path

$lines = Get-Content -LiteralPath $path

# Find the line with "const css" assignment
$idxConst = -1
for ($i=0; $i -lt $lines.Count; $i++){
  if ($lines[$i] -match '^\s*const\s+css\s*=\s*$' -or $lines[$i] -match '^\s*const\s+css\s*=\s*$') {
    $idxConst = $i
    break
  }
  # also handle "const css =" with trailing spaces
  if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
  if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
}
if ($idxConst -lt 0) {
  # More common: "const css =" on one line, nothing after it
  for ($i=0; $i -lt $lines.Count; $i++){
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
  }
}
if ($idxConst -lt 0) {
  # Most likely actual line is: const css =
  for ($i=0; $i -lt $lines.Count; $i++){
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$' -or $lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
  }
}
if ($idxConst -lt 0) {
  # fallback: look for "const css =" exact
  for ($i=0; $i -lt $lines.Count; $i++){
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$' -or $lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
  }
}
if ($idxConst -lt 0) {
  # final fallback
  for ($i=0; $i -lt $lines.Count; $i++){
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
    if ($lines[$i] -match '^\s*const\s+css\s*=\s*$') { $idxConst = $i; break }
  }
}
if ($idxConst -lt 0) {
  # simplest match
  for ($i=0; $i -lt $lines.Count; $i++){
    if ($lines[$i].Trim() -eq "const css =") { $idxConst = $i; break }
  }
}

if ($idxConst -lt 0) { Fail "Could not find 'const css =' in $path" }

# If it's already a template literal, do nothing
if ($lines[$idxConst] -match '`\s*$') {
  Ok "Looks already wrapped in template literal. No changes."
  Write-Host ""
  Write-Host "NEXT: npm run build" -ForegroundColor Yellow
  exit 0
}

# Find the start of the return statement after the css block
$idxReturn = -1
for ($i=$idxConst+1; $i -lt $lines.Count; $i++){
  if ($lines[$i] -match '^\s*return\b') { $idxReturn = $i; break }
}
if ($idxReturn -lt 0) { Fail "Could not find 'return' after css block in $path" }

# Insert opening backtick right after "const css ="
$lines[$idxConst] = ($lines[$idxConst].TrimEnd() + " `")

# Insert closing backtick on the line immediately before return, unless one already exists there
$beforeReturn = $idxReturn - 1
if ($beforeReturn -lt 0) { Fail "Unexpected structure: return at top of file" }

if ($lines[$beforeReturn] -notmatch '`\s*;?\s*$') {
  # End the template literal cleanly. If that line is empty, replace it; otherwise append a new line.
  if ($lines[$beforeReturn].Trim().Length -eq 0) {
    $lines[$beforeReturn] = "`"
  } else {
    $lines = $lines[0..$beforeReturn] + @("`") + $lines[($beforeReturn+1)..($lines.Count-1)]
    $idxReturn++ # because we inserted a line before return
  }
}

# Ensure semicolon after closing backtick by transforming "`" into "`;"
# (only if next non-empty line isn't already ending the assignment)
# We'll add semicolon on the line that contains only a backtick
for ($i=$idxConst+1; $i -lt $idxReturn; $i++){
  if ($lines[$i].Trim() -eq "`") { $lines[$i] = "`;"; break }
}

WriteNoBom $path ($lines -join "`n")
Ok "Wrapped raw CSS in a template literal in: $path"

Write-Host ""
Write-Host "NEXT (copy/paste):" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""fix(ui): wrap FallbackStyles css in template literal""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
