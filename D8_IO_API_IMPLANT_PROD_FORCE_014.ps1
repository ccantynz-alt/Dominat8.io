Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom([string]$Path,[string]$Content){
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-IfExists([string]$Path){
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $Path -Destination ($Path + ".bak_" + $ts) -Force
    Info ("Backup: " + $Path + ".bak_" + $ts)
  }
}

# ---- repo root lock ----
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info "Locked PWD: $(Get-Location)"

if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "package.json missing. Wrong folder." }
try { $null = git rev-parse --is-inside-work-tree 2>$null } catch { Fail "Not a git repo." }
try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

# ---- ensure main ----
git checkout main | Out-Null
git pull origin main | Out-Null

# ---- STAMP ----
$Stamp = "D8_IO_API_014_{0}" -f (Get-Date -Format "yyyyMMdd_HHmmss")
$Sha = (git rev-parse HEAD).Trim()
Ok "Stamp: $Stamp"
Ok "Git:   $Sha"

# ---- ensure /io page exists in src tree (already working, but keep it anchored) ----
$ioPage = ".\src\app\io\page.tsx"
if (-not (Test-Path -LiteralPath $ioPage)) {
  Warn "src/app/io/page.tsx missing; creating minimal /io proof page (should already exist)."
  Write-Utf8NoBom $ioPage @"
export const dynamic = "force-dynamic";
export default function IOCockpit() {
  const STAMP = "$Stamp";
  return (
    <main style={{minHeight:"100vh",background:"#000",color:"#fff",padding:24}}>
      <div style={{position:"fixed",top:10,right:12,fontSize:11,opacity:0.75,zIndex:999999}}>
        PROOF: {STAMP}
      </div>
      <h1 style={{fontSize:28,margin:0}}>Dominat8 IO — /io is LIVE</h1>
      <p style={{opacity:0.85,marginTop:10}}>If you see this, /io exists.</p>
    </main>
  );
}
"@
  Ok "Wrote: $ioPage"
} else {
  Ok "Found: $ioPage"
}

# ---- create API routes in the ACTIVE app tree: src/app/api/io/* ----
$health = ".\src\app\api\io\health\route.ts"
$ping   = ".\src\app\api\io\ping\route.ts"
$state  = ".\src\app\api\io\state\route.ts"

Backup-IfExists $health
Backup-IfExists $ping
Backup-IfExists $state

$healthContent = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body = { ok: true, stamp: "$Stamp", git: "$Sha", now: new Date().toISOString() };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-d8-proof": "$Stamp"
    }
  });
}
"@

$pingContent = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("PONG: $Stamp`n", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "x-d8-proof": "$Stamp" }
  });
}
"@

$stateContent = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, stamp: "$Stamp" }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "x-d8-proof": "$Stamp" }
  });
}
"@

Write-Utf8NoBom $health $healthContent
Write-Utf8NoBom $ping   $pingContent
Write-Utf8NoBom $state  $stateContent

Ok "Wrote: $health"
Ok "Wrote: $ping"
Ok "Wrote: $state"

# ---- commit + push ----
git add -A | Out-Null
$staged = git diff --cached --name-only
if (-not $staged) { Fail "Nothing staged — unexpected (files not created?)." }

$msg = "D8: add src/app/api/io health+ping+state ($Stamp)"
git commit -m $msg | Out-Null
Ok "Committed: $msg"

git push origin main | Out-Null
Ok "Pushed: origin/main"

# ---- force prod deploy ----
Write-Host ""
Info "Vercel whoami:"
vercel whoami

Write-Host ""
Info "vercel link --yes (may no-op):"
try { vercel link --yes | Out-Host } catch { Warn "vercel link may require interactive auth/link. Continuing." }

Write-Host ""
Info "vercel deploy --prod --yes:"
vercel deploy --prod --yes | Out-Host
Ok "Prod deploy issued."

# ---- PROOF (IMPORTANT: set $ts locally) ----
Write-Host ""
$ts = [int](Get-Date -UFormat %s)

Ok "PROOF: /api/io/health headers (first 40 lines)"
curl.exe -s -D - -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/api/io/health?ts=$ts" | Select-Object -First 40

Write-Host ""
Ok "PROOF: /api/io/health body (first 5 lines)"
curl.exe -s -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/api/io/health?ts=$ts" | Select-Object -First 5

Write-Host ""
Ok "PROOF: /io contains PROOF:"
curl.exe -s -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/io?ts=$ts" | findstr /I "PROOF:"

Write-Host ""
Ok "If /api/io/health is HTTP 200 AND has x-d8-proof, start loop:"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\D8_IO_AUTO_LOOP_DOCTOR_011.ps1" -ForegroundColor Yellow