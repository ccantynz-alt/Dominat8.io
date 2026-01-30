# UPGRADE_2026-01-31_FIX_D8SECTION_TONE_REAL_SOURCE.ps1
# Finds the *actual* D8SectionProps used by marketing pages and adds `tone`.
# Patches ALL occurrences under src/** to avoid “two D8Sections” confusion.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
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

# 1) Find all files in src that define D8SectionProps or D8Section
$files = Get-ChildItem -Path "src" -Recurse -File -Include *.ts,*.tsx | Select-Object -ExpandProperty FullName

$targets = @()
foreach ($f in $files) {
  $txt = Get-Content -LiteralPath $f -Raw
  if ($txt -match 'D8SectionProps' -and ($txt -match 'D8Section' -or $txt -match 'export\s+type\s+D8SectionProps')) {
    $targets += $f
  }
}

if ($targets.Count -eq 0) {
  Fail "Could not find any files under src/ containing D8SectionProps. Paste the import line from pricing/page.tsx and I’ll target it precisely."
}

Ok ("Found candidates: " + ($targets.Count))

# 2) Patch each candidate safely
foreach ($path in $targets) {
  $src = Get-Content -LiteralPath $path -Raw
  $original = $src

  # A) Add tone to exported type definition if present and not already included
  if ($src -match 'export\s+type\s+D8SectionProps') {
    if ($src -notmatch "tone\?\s*:") {
      # Insert tone after opening brace of the type
      $src = [System.Text.RegularExpressions.Regex]::Replace(
        $src,
        'export\s+type\s+D8SectionProps\s*=\s*\{',
        "export type D8SectionProps = {`n  tone?: 'default' | 'glass' | 'dark';",
        1
      )
    }
  }

  # B) Add tone to interface definition if present and not already included
  if ($src -match 'export\s+interface\s+D8SectionProps') {
    if ($src -notmatch "tone\?\s*:") {
      $src = [System.Text.RegularExpressions.Regex]::Replace(
        $src,
        'export\s+interface\s+D8SectionProps\s*\{',
        "export interface D8SectionProps {`n  tone?: 'default' | 'glass' | 'dark';",
        1
      )
    }
  }

  # C) If component destructures props in signature: function D8Section({ ... }: D8SectionProps)
  if ($src -match 'D8Section\s*\(\s*\{') {
    if ($src -notmatch 'tone\s*=') {
      # Add tone = 'default' near the start of destructuring block (best-effort)
      $src = [System.Text.RegularExpressions.Regex]::Replace(
        $src,
        '(D8Section\s*\(\s*\{\s*)',
        '$1tone = ''default'', ',
        1
      )
    }
  }

  # D) If component uses props object then destructures: const { ... } = props
  if ($src -match 'const\s*\{\s*[^}]*\}\s*=\s*props' -and $src -notmatch 'tone\s*=') {
    $src = [System.Text.RegularExpressions.Regex]::Replace(
      $src,
      'const\s*\{\s*',
      "const { tone = 'default', ",
      1
    )
  }

  if ($src -ne $original) {
    Backup $path
    WriteNoBom $path $src
    Ok "Patched tone support in: $path"
  } else {
    Warn "No changes needed in: $path"
  }
}

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Yellow
Write-Host "  git commit -m ""feat(ui): add tone prop to the D8Section actually used by marketing pages""" -ForegroundColor Yellow
Write-Host "  git push" -ForegroundColor Yellow
