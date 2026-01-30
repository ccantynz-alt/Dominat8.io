# UPGRADE_2026-01-31_FIX_PAGE_IMPORT_NEWLINES.ps1
# Fixes broken imports caused by literal `n sequences in src/app/page.tsx

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

$path = "src/app/page.tsx"
Backup $path

$src = Get-Content $path -Raw

# Remove any literal `n sequences that broke imports
$src = $src -replace ';`n',';'
$src = $src -replace '`n',''

# Normalize the top of file imports explicitly
$src = $src -replace '(?s)^.*?import HomeClient from "\./_client/HomeClient";',
@"
import { AppNav } from "../ui/layout/AppNav";
import { AppFooter } from "../ui/layout/AppFooter";

export const dynamic = "force-dynamic";

import HomeClient from "./_client/HomeClient";
"@

WriteNoBom $path $src
Ok "Rewrote imports cleanly in $path"

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
