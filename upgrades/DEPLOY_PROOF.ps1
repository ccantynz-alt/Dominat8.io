Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$m) { throw "ERROR: $m" }
function Info([string]$m) { Write-Host $m -ForegroundColor Cyan }
function Ok([string]$m) { Write-Host $m -ForegroundColor Green }
function Warn([string]$m) { Write-Host $m -ForegroundColor Yellow }

if (-not (Test-Path -LiteralPath ".git")) { Fail "Run from repo root (folder with .git)." }

$repo = (git config --get remote.origin.url)
Info "Repo: $repo"

# Ensure main and up to date
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne "main") { Info "Switching to main"; git checkout main | Out-Host }

Info "Fetching + syncing origin/main..."
git fetch origin | Out-Host
git pull --ff-only origin main | Out-Host

$beforeLocal  = (git rev-parse HEAD).Trim()
$beforeRemote = (git rev-parse origin/main).Trim()
Info "BEFORE  local HEAD : $beforeLocal"
Info "BEFORE  origin/main: $beforeRemote"

# ===== WRITE HOMEPAGE (INLINE-SAFE WOW) =====
$target = ".\src\app\page.tsx"
New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null

$stamp   = (Get-Date -Format "yyyyMMdd_HHmmss")
$buildId = "BUILD_ID_" + $stamp
$buildIso = (Get-Date).ToUniversalTime().ToString("o")

if (Test-Path -LiteralPath $target) {
  Copy-Item -LiteralPath $target -Destination ".\src\app\page.tsx.bak_DEPLOY_PROOF_$stamp" -Force
  Warn "Backup created: .\src\app\page.tsx.bak_DEPLOY_PROOF_$stamp"
}

$tsx = @"
export const dynamic = "force-dynamic";

export default function HomePage() {
  const BUILD_ID = "$buildId";
  return (
    <main style={{
      minHeight: "100vh",
      padding: "48px 18px",
      color: "#EEF2FF",
      background:
        "radial-gradient(1400px 800px at 15% -10%, rgba(255,215,0,0.16), transparent 60%), " +
        "radial-gradient(1200px 700px at 85% 0%, rgba(0,255,200,0.12), transparent 55%), " +
        "radial-gradient(900px 500px at 55% 35%, rgba(140,120,255,0.12), transparent 60%), " +
        "linear-gradient(180deg,#05060a 0%,#070913 55%,#05060a 100%)"
    }}>
      <div style={{ position: "absolute", left: -9999, top: -9999 }}>{BUILD_ID}</div>

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
          padding: "14px 16px", borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(6,7,12,0.45)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(255,215,0,0.92), rgba(0,255,200,0.70))",
              boxShadow: "0 10px 30px rgba(0,0,0,0.55)"
            }} />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Dominat8</div>
              <div style={{ opacity: 0.65, fontSize: 12 }}>AI Website Automation</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/templates" style={{ textDecoration: "none", color: "rgba(238,242,255,0.86)", fontSize: 13, padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>Templates</a>
            <a href="/use-cases" style={{ textDecoration: "none", color: "rgba(238,242,255,0.86)", fontSize: 13, padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>Use Cases</a>
            <a href="/pricing" style={{ textDecoration: "none", color: "rgba(238,242,255,0.86)", fontSize: 13, padding: "8px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>Pricing</a>
            <a href="/templates" style={{ textDecoration: "none", fontWeight: 950, color: "#061018", padding: "10px 14px", borderRadius: 16, background: "linear-gradient(135deg, rgba(255,215,0,0.96), rgba(0,255,200,0.80))", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 60px rgba(0,0,0,0.45)" }}>Launch -></a>
          </div>
        </div>

        <div style={{ marginTop: 34 }}>
          <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.05, letterSpacing: -1.2 }}>
            Build a flagship homepage that feels <span style={{
              background: "linear-gradient(90deg, rgba(255,215,0,0.98), rgba(0,255,200,0.92), rgba(140,120,255,0.92))",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"
            }}>expensive</span>.
          </h1>

          <p style={{ marginTop: 14, fontSize: 18, lineHeight: 1.7, opacity: 0.86, maxWidth: 820 }}>
            This deploy is fully proofed end-to-end. Marker: <strong>{BUILD_ID}</strong>
          </p>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/templates" style={{ textDecoration: "none", fontWeight: 950, color: "#061018", padding: "14px 18px", borderRadius: 18, minWidth: 220, background: "linear-gradient(135deg, rgba(255,215,0,0.96), rgba(0,255,200,0.80))", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 22px 70px rgba(0,0,0,0.55)" }}>Start building</a>
            <a href="/use-cases" style={{ textDecoration: "none", fontWeight: 850, color: "rgba(238,242,255,0.92)", padding: "14px 18px", borderRadius: 18, minWidth: 190, background: "rgba(10,12,18,0.32)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 52px rgba(0,0,0,0.32)" }}>See outcomes</a>
          </div>
        </div>
      </div>
    </main>
  );
}
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $target), $tsx, $utf8NoBom)
Ok "WROTE page.tsx (marker $buildId)"

# ===== LOCAL BUILD GATE =====
Info "Build gate: npm run build"
npm run build | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "Local build failed. Not committing or pushing." }
Ok "Local build PASSED"

# ===== COMMIT + PUSH =====
git add -A | Out-Host
$st = (git status --porcelain)
if ([string]::IsNullOrWhiteSpace($st)) { Fail "No changes detected; nothing to commit." }

$commitMsg = "feat(homepage): deploy-proof marker $buildId"
git commit -m $commitMsg | Out-Host

$afterLocal = (git rev-parse HEAD).Trim()
Info "AFTER   local HEAD : $afterLocal"

Info "Pushing to origin/main (deploy trigger)..."
git push origin main | Out-Host

git fetch origin | Out-Host
$afterRemote = (git rev-parse origin/main).Trim()
Info "AFTER   origin/main: $afterRemote"

if ($afterRemote -ne $afterLocal) { Fail "Push did not update origin/main. Something blocked the push." }
Ok "Push confirmed on GitHub."

# ===== LIVE VERIFY (vercel.app first, then domain) =====
Start-Sleep -Seconds 2
$ts = [int][double]::Parse((Get-Date -UFormat %s))

function GetMarker([string]$url) {
  $r = Invoke-WebRequest -UseBasicParsing -Uri ($url + "?ts=" + $ts)
  (($r.Content | Select-String -Pattern "BUILD_ID_[0-9_]+" -AllMatches).Matches.Value | Select-Object -First 1)
}

Info "Checking live markers (may take a moment if Vercel is building)..."
$mVercel = GetMarker "https://my-saas-app-5eyw.vercel.app/"
$mDomain = GetMarker "https://www.dominat8.com/"

Info "LIVE vercel.app marker: $mVercel"
Info "LIVE domain     marker: $mDomain"
Warn "Expected marker (new): $buildId"
Warn "If live marker is still old, Vercel build is still running or failed. Check Vercel build logs for the latest commit hash."

Ok "DEPLOY_PROOF script completed."
