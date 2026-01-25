$ErrorActionPreference = "Stop"

function Fail($msg) {
  Write-Host ""
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}
function Ok($msg) { Write-Host "OK: $msg" -ForegroundColor Green }
function Info($msg) { Write-Host "INFO: $msg" -ForegroundColor Cyan }

if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "Run from repo root (package.json missing)." }

# --- Paths
$HomePage = ".\src\app\page.tsx"
if (-not (Test-Path -LiteralPath $HomePage)) { Fail "Missing: $HomePage" }

$CompDir = ".\src\components\marketing\home"
if (-not (Test-Path -LiteralPath $CompDir)) {
  New-Item -ItemType Directory -Path $CompDir -Force | Out-Null
  Ok "Created: src/components/marketing/home"
}

# --- Backup homepage
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$bak = $HomePage + ".bak_" + $stamp
Copy-Item -LiteralPath $HomePage -Destination $bak -Force
Ok ("Backed up homepage to: " + $bak)

# --- Write components (server-safe, no hooks)

@'
type Props = {
  label: string;
};

export default function GlowPill({ label }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
      <span>{label}</span>
    </div>
  );
}
