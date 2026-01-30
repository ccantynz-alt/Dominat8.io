# UPGRADE_2026-01-31_FIX_PAGE_DIV_ERROR.ps1
# Fix: "Cannot find name 'div'" in src/app/page.tsx by ensuring return has a single root wrapper.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function Backup-IfExists {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $bak = "$Path.bak_$stamp"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    Ok "Backup: $bak"
  } else {
    Fail "Missing file: $Path"
  }
}

function Read-Text([string]$Path){
  return [System.IO.File]::ReadAllText($Path, (New-Object System.Text.UTF8Encoding($false)))
}

function Write-Utf8NoBom {
  param([string]$Path,[string]$Content)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

$path = "src/app/page.tsx"
Backup-IfExists $path

$txt = Read-Text $path

# If already wrapped in fragment in the return, do nothing.
if ($txt -match "return\s*\(\s*<>") {
  Ok "Already wrapped with fragment <>...</>. No change needed."
  exit 0
}

# Replace the first occurrence of: return (  with: return (<> 
# and the matching close: ) with: </>)
# We do a conservative transform:
# 1) Insert <> right after "return ("
# 2) Insert </> right before the *first* line that is just ")"
# This fixes the exact symptom without rearranging content.

$txt2 = $txt -replace "return\s*\(\s*", "return (`n    <>`n", 1

# Insert </> before a line that contains only ')' (possibly with spaces)
# Use regex multiline
if ($txt2 -notmatch "(?m)^\s*\)\s*;?\s*$") {
  Fail "Could not find closing ')' line for the return block. Manual review needed."
}

$txt2 = [System.Text.RegularExpressions.Regex]::Replace(
  $txt2,
  "(?m)^\s*\)\s*;?\s*$",
  "    </>`n  )",
  1
)

Write-Utf8NoBom $path $txt2
Ok "Patched: $path"
Ok "Now run: npm run build"
