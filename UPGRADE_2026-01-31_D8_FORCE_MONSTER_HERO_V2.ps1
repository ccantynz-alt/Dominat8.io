Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
  param([Parameter(Mandatory=$true)][string]$Path,[Parameter(Mandatory=$true)][string]$Content)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-IfExists {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $Path -Destination "$Path.bak_$ts" -Force
  }
}

function Find-RepoRoot {
  param([Parameter(Mandatory=$true)][string]$StartDir)
  $d = (Resolve-Path -LiteralPath $StartDir).Path
  for ($i=0; $i -lt 12; $i++) {
    if ((Test-Path -LiteralPath (Join-Path $d "package.json")) -and (Test-Path -LiteralPath (Join-Path $d "src\app"))) { return $d }
    $p = Split-Path -Parent $d
    if (-not $p -or $p -eq $d) { break }
    $d = $p
  }
  throw "Repo root not found from: $StartDir (need package.json + src\app)"
}

$RepoRoot = Find-RepoRoot -StartDir (Get-Location).Path

$DoCommit = ($env:D8_UPGRADE_COMMIT -eq "1")
$DoPush   = ($env:D8_UPGRADE_PUSH   -eq "1")
$DoDeploy = ($env:D8_UPGRADE_DEPLOY -eq "1")

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$BUILD_STAMP = "D8_HOME_MONSTER_HERO_V2_$ts"
$PROOF_TOKEN = "D8_MONSTER_PROOF_$ts"

Write-Host ""
Write-Host "=== FORCE MONSTER HERO (V2) ===" -ForegroundColor Cyan
Write-Host "RepoRoot    : $RepoRoot" -ForegroundColor Cyan
Write-Host "BUILD_STAMP : $BUILD_STAMP" -ForegroundColor Cyan
Write-Host "PROOF_TOKEN : $PROOF_TOKEN" -ForegroundColor Cyan
Write-Host ""

$pagePath   = Join-Path $RepoRoot "src\app\page.tsx"
$clientPath = Join-Path $RepoRoot "src\app\_client\MonsterHeroClient.tsx"

$pageContent = @"
/* ===== $BUILD_STAMP =====
   Dominat8 Homepage — MONSTER HERO V2
   Proof: $PROOF_TOKEN
*/

import MonsterHeroClient from "./_client/MonsterHeroClient";

export const metadata = {
  title: "Dominat8 — Your website doesn't sit there. It works.",
  description: "Generate. Launch. Rank. The AI system that keeps your site alive and growing.",
};

export default function Page() {
  return <MonsterHeroClient buildStamp={"$BUILD_STAMP"} proofToken={"$PROOF_TOKEN"} />;
}
"@

$clientContent = @"
'use client';

/* ===== $BUILD_STAMP =====
   MonsterHeroClient V2
   Proof: $PROOF_TOKEN
*/

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = { buildStamp: string; proofToken: string };

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

function usePointerGlow() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 35 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      setPos({
        x: clamp((e.clientX / w) * 100, 0, 100),
        y: clamp((e.clientY / h) * 100, 0, 100),
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove as any);
  }, []);
  return pos;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

export default function MonsterHeroClient({ buildStamp, proofToken }: Props) {
  const glow = usePointerGlow();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => setNow(new Date().toISOString());
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  const proofChip = useMemo(() => `MONSTER:${proofToken.slice(-12)}`, [proofToken]);

  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      {/* HARD PROOF MARKER */}
      <div id="d8-monster-proof" data-build={buildStamp} data-proof={proofToken} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
        {buildStamp} {proofToken}
      </div>

      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1200px 700px at 50% -10%, rgba(126,231,255,0.18), rgba(0,0,0,0) 60%)," +
              "radial-gradient(900px 600px at 100% 40%, rgba(255,196,126,0.16), rgba(0,0,0,0) 60%)," +
              "radial-gradient(900px 600px at 0% 70%, rgba(170,126,255,0.12), rgba(0,0,0,0) 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-55"
          style={{
            background: `radial-gradient(520px 520px at ${glow.x}% ${glow.y}%, rgba(126,231,255,0.24), rgba(0,0,0,0) 70%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 78%)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(80% 70% at 50% 20%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <span className="text-sm font-semibold">D8</span>
            </span>
            <span className="text-sm font-semibold tracking-[0.12em] text-white/90">DOMINAT8</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Link className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10" href="/pricing">Pricing</Link>
            <Link className="rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 ring-1 ring-transparent hover:ring-white/10" href="/templates">Templates</Link>
            <Link className="rounded-xl px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-white/90" href="/projects">Open Builder</Link>
          </nav>

          <div className="sm:hidden">
            <Link className="rounded-xl px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-white/90" href="/projects">Builder</Link>
          </div>
        </header>

        <section className="pt-12 pb-16">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap gap-2">
                <Pill>AI Active</Pill>
                <Pill><span className="font-mono text-white/80">{proofChip}</span></Pill>
                <Pill>Build: <span className="ml-1 font-mono text-white/70">{buildStamp}</span></Pill>
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
                Your website doesn’t sit there.
                <span className="block text-white/75">It works.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Dominat8 builds your site and keeps it alive — pages, SEO signals, freshness, and proof-of-action —
                so you ship faster and grow without babysitting.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90" href="/signup">Start free</Link>
                <Link className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/8" href="/command">View Command Core</Link>
                <span className="text-xs text-white/50 sm:pl-2">Now: <span className="font-mono text-white/60">{now || "—"}</span></span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/12 backdrop-blur shadow-[0_18px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/90">Monster Proof</div>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10">LIVE</div>
                </div>
                <div className="mt-4 rounded-2xl bg-black/35 p-4 ring-1 ring-white/10">
                  <div className="text-xs font-semibold tracking-wide text-white/60">This deploy must contain:</div>
                  <ul className="mt-3 space-y-2 text-sm text-white/75">
                    <li className="flex items-start gap-2"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90"></span><span><span className="font-semibold text-white/85">#d8-monster-proof</span> hidden marker</span></li>
                    <li className="flex items-start gap-2"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90"></span><span><span className="font-semibold text-white/85">{buildStamp}</span></span></li>
                    <li className="flex items-start gap-2"><span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400/90"></span><span><span className="font-semibold text-white/85">{proofToken}</span></span></li>
                  </ul>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90" href="/projects">Build a Site</Link>
                  <Link className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/8" href="/pricing">View pricing</Link>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-white/50">
                  <span>Proof token</span>
                  <span className="font-mono text-white/60">{proofToken}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-10">
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-white/50">© 2026 DOMINAT8 • Monster Hero V2</div>
            <div className="text-xs text-white/40 font-mono">{buildStamp}</div>
          </div>
        </footer>
      </div>
    </main>
  );
}
"@

Write-Host "=== WRITE FILES ===" -ForegroundColor Yellow
Backup-IfExists -Path $pagePath
Write-Utf8NoBom -Path $pagePath -Content $pageContent
Write-Host "Wrote: $pagePath" -ForegroundColor Green

Backup-IfExists -Path $clientPath
Write-Utf8NoBom -Path $clientPath -Content $clientContent
Write-Host "Wrote: $clientPath" -ForegroundColor Green

Write-Host ""
Write-Host "=== LOCAL CHECK ===" -ForegroundColor Yellow
Select-String -LiteralPath $pagePath -Pattern $BUILD_STAMP -SimpleMatch | Out-Host

Write-Host ""
Write-Host "=== DONE WRITING. NEXT: npm run build ===" -ForegroundColor Yellow

if ($DoCommit) {
  git add --all
  git commit -m "d8: monster hero v2 ($BUILD_STAMP)"
}

if ($DoPush) { git push }

if ($DoDeploy) { vercel --prod --force }

Write-Host ""
Write-Host "POST-DEPLOY VERIFY:" -ForegroundColor Yellow
Write-Host "  curl.exe -s -D - --max-time 20 `"https://www.dominat8.com/?ts=$([int](Get-Date -UFormat %s))`" | Select-String -Pattern `"d8-monster-proof|$BUILD_STAMP`" -SimpleMatch" -ForegroundColor Cyan