Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "C:\Temp\FARMS\Dominat8.io-clone"

function Backup-File([string]$p) {
  if (Test-Path -LiteralPath $p) {
    $bak = "$p.bak_20260203_201540"
    Copy-Item -LiteralPath $p -Destination $bak -Force
    Write-Host "BACKUP: $bak" -ForegroundColor DarkGray
  }
}

Write-Host "
=== A2 PATCH BUILD BLOCKERS (safe, no UI changes) ===" -ForegroundColor Cyan

# 1) Disable heartbeat route (it is not required to show the marketing site)
$hb = ".\src\app\api\machine\heartbeat\route.ts"
if (Test-Path -LiteralPath $hb) {
  Backup-File $hb
@'
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMP SAFE MODE: machine heartbeat disabled to unblock production build.
 * Not required to render the marketing site.
 * Restore full heartbeat after site is live.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      heartbeat: "disabled_safe_mode",
      ts: new Date().toISOString(),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
'@ | Set-Content -LiteralPath $hb -Encoding UTF8
  Write-Host "PATCHED: $hb (safe-mode no-op)" -ForegroundColor Green
} else {
  Write-Host "SKIP: heartbeat route not found: $hb" -ForegroundColor Yellow
}

# 2) Fix _execute.ts escalate() call shape: EscalationInput = { issue?, detail?, context? }
$exec = ".\src\app\api\machine\_execute.ts"
if (Test-Path -LiteralPath $exec) {
  $txt = Get-Content -LiteralPath $exec -Raw
  if ($txt -match "escalate\(\s*\{\s*code\s*:") {
    Backup-File $exec
    $txt = $txt -replace "escalate\(\s*\{\s*code\s*:\s*"([^"]+)"\s*\}\s*\)", "escalate({ issue: "$1" })"
    $txt | Set-Content -LiteralPath $exec -Encoding UTF8
    Write-Host "PATCHED: $exec (escalate({ issue: ... }))" -ForegroundColor Green
  } else {
    Write-Host "OK: $exec (no code: field found)" -ForegroundColor DarkGray
  }
} else {
  Write-Host "SKIP: not found: $exec" -ForegroundColor Yellow
}

# 3) Fix runGuard(req) type mismatch in machine API routes (expects string; pass req.url)
$routes = @(
  ".\src\app\api\machine\execute\route.ts",
  ".\src\app\api\machine\guard\route.ts"
)

foreach ($r in $routes) {
  if (Test-Path -LiteralPath $r) {
    $t = Get-Content -LiteralPath $r -Raw
    if ($t -match "runGuard\(\s*req\s*\)") {
      Backup-File $r
      $t = $t -replace "runGuard\(\s*req\s*\)", "runGuard(req.url)"
      $t | Set-Content -LiteralPath $r -Encoding UTF8
      Write-Host "PATCHED: $r (runGuard(req.url))" -ForegroundColor Green
    } else {
      Write-Host "OK: $r (no runGuard(req) found)" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "SKIP: not found: $r" -ForegroundColor Yellow
  }
}

Write-Host "
=== A2 DONE ===" -ForegroundColor Green
