#requires -version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot,

  [string]$StagingBaseUrl = "",

  [int]$MaxTimeSeconds = 25
)

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Cyan }
function Bad($m){ Write-Host "FAIL $m" -ForegroundColor Red; throw $m }

function Require-Command($name){
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { Bad "Missing command: $name" }
}

function Ensure-Dir($path){
  if (-not (Test-Path -LiteralPath $path)) { New-Item -ItemType Directory -Path $path -Force | Out-Null }
}

function Backup-File($path){
  if (Test-Path -LiteralPath $path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $path -Destination ($path + ".bak_" + $ts) -Force
  }
}

function Normalize-BaseUrl([string]$u){
  $u = $u.Trim()
  if ($u -eq "") { return "" }
  if ($u.EndsWith("/")) { $u = $u.TrimEnd("/") }
  if (-not ($u -match '^https://')) { Bad "StagingBaseUrl must start with https:// (got: $u)" }
  return $u
}

function Curl-Headers([string]$url){
  $ts=[int](Get-Date -UFormat %s)
  curl.exe -s -D - -L --max-time $MaxTimeSeconds "$url?ts=$ts" 2>$null | Select-Object -First 40
}

function Curl-Body([string]$url){
  $ts=[int](Get-Date -UFormat %s)
  curl.exe -s -L --max-time $MaxTimeSeconds "$url?ts=$ts" 2>$null
}

function Get-LatestProdUrl(){
  $raw = cmd /c "vercel ls" 2>&1
  if (-not $raw) { Bad "vercel ls returned no output" }

  $prod = $raw | Where-Object { ($_ -match 'https://') -and ($_ -match 'Production') } | Select-Object -First 1
  if (-not $prod) { Bad "Could not locate a Production deployment line containing a URL in RAW vercel ls output." }

  $url = ([regex]::Match($prod, 'https://\S+')).Value
  if (-not $url) { Bad "Could not extract URL from line: $prod" }
  return $url
}

# -------------------- START --------------------
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
if (-not (Test-Path -LiteralPath $RepoRoot)) { Bad "RepoRoot not found: $RepoRoot" }
Set-Location -LiteralPath $RepoRoot

Require-Command git
Require-Command vercel
Require-Command curl.exe

if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo: $RepoRoot" }
if (-not (Test-Path -LiteralPath ".\package.json")) { Bad "package.json missing at repo root: $RepoRoot" }

$StagingBaseUrl = Normalize-BaseUrl $StagingBaseUrl

Info "LOCKED PWD: $(Get-Location)"

Info "Vercel link (non-destructive)"
cmd /c "cd /d `"$RepoRoot`" && vercel link --yes" | Out-Host

if ($StagingBaseUrl -ne "") {
  Info "Setting env NEXT_PUBLIC_STAGING_BASE_URL (production + preview)"
  $escaped = $StagingBaseUrl.Replace("^","^^")
  cmd /c "cd /d `"$RepoRoot`" && (echo $escaped) | vercel env add NEXT_PUBLIC_STAGING_BASE_URL production --force --yes" | Out-Host
  cmd /c "cd /d `"$RepoRoot`" && (echo $escaped) | vercel env add NEXT_PUBLIC_STAGING_BASE_URL preview --force --yes" | Out-Host
  Ok "Env set"
} else {
  Info "StagingBaseUrl not provided; env unchanged."
}

# Detect roots for app/pages (src first, then root)
$roots = @()
if (Test-Path -LiteralPath ".\src") { $roots += (Resolve-Path ".\src").Path }
$roots += (Resolve-Path ".").Path

$installed = New-Object System.Collections.Generic.List[string]

# App Router install
foreach ($r in $roots) {
  $app = Join-Path $r "app"
  if (Test-Path -LiteralPath $app) {
    $tvDir = Join-Path $app "tv"
    Ensure-Dir $tvDir
    $page = Join-Path $tvDir "page.tsx"
    Backup-File $page

@'
"use client";

import React, { useEffect, useMemo, useState } from "react";

type R = { ok: boolean; status: number | null; body: string; at: string };

function iso(){ try { return new Date().toISOString(); } catch { return ""; } }

async function getText(url: string, timeoutMs: number): Promise<R> {
  const at = iso();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal, headers: { "cache-control": "no-store" } });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body, at };
  } catch (e: any) {
    const msg = (e?.name === "AbortError") ? "TIMEOUT" : ("FETCH_ERROR: " + (e?.message ?? String(e)));
    return { ok: false, status: null, body: msg, at };
  } finally {
    clearTimeout(t);
  }
}

export default function Tv() {
  const baseRaw = (process.env.NEXT_PUBLIC_STAGING_BASE_URL || "").replace(/\/+$/, "");
  const baseMissing = !baseRaw;

  const healthUrl = useMemo(() => baseMissing ? "" : `${baseRaw}/healthz`, [baseRaw, baseMissing]);
  const stampUrl  = useMemo(() => baseMissing ? "" : `${baseRaw}/api/debug/stamp`, [baseRaw, baseMissing]);

  const [health, setHealth] = useState<R | null>(null);
  const [stamp, setStamp]   = useState<R | null>(null);
  const [tick, setTick]     = useState<number>(0);

  useEffect(() => {
    if (baseMissing) return;

    const run = async () => {
      const ts = Math.floor(Date.now()/1000);
      setHealth(await getText(`${healthUrl}?ts=${ts}`, 12000));
      setStamp(await getText(`${stampUrl}?ts=${ts}`, 12000));
      setTick((x) => x + 1);
    };

    run();
    const id = setInterval(run, 5000);
    return () => clearInterval(id);
  }, [baseMissing, healthUrl, stampUrl]);

  const isGreen = !!health?.ok && !!stamp?.ok;

  const promoteCmd =
`powershell -NoProfile -ExecutionPolicy Bypass \`
  -File ".\\D8_IO_PROMOTE_STAGING_TO_LIVE_001.ps1" \`
  -RepoRoot "C:\\Temp\\FARMS\\Dominat8.io-clone"`;

  return (
    <main style={{ minHeight:"100vh", padding:24, background:"#05070a", color:"#eaf0ff", fontFamily:"ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial" }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:16, flexWrap:"wrap", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:28, fontWeight:900 }}>DOMINAT8 TV — STAGING</div>
          <div style={{ marginTop:6, opacity:0.8 }}>Refresh: 5s · Tick: {tick} · Now: {iso()}</div>
          <div style={{ marginTop:6, opacity:0.75, fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace" }}>
            NEXT_PUBLIC_STAGING_BASE_URL: {baseMissing ? "(NOT SET)" : baseRaw}
          </div>
        </div>
        <div style={{
          padding:"10px 14px", borderRadius:10, fontWeight:900, minWidth:140, textAlign:"center",
          border:"1px solid rgba(255,255,255,0.12)",
          background: baseMissing ? "rgba(255,196,0,0.10)" : (isGreen ? "rgba(0,255,160,0.12)" : "rgba(255,64,64,0.12)"),
          color: baseMissing ? "#ffd27a" : (isGreen ? "#73ffcb" : "#ff9b9b")
        }}>
          {baseMissing ? "ENV MISSING" : (isGreen ? "GREEN" : "RED")}
        </div>
      </div>

      <section style={{ marginTop:18, padding:14, borderRadius:12, border:"1px solid rgba(255,255,255,0.10)", background:"rgba(255,255,255,0.03)" }}>
        <div style={{ fontWeight:900 }}>STAGING /healthz</div>
        <div style={{ opacity:0.75, fontFamily:"ui-monospace, monospace" }}>{healthUrl || "(missing env)"}</div>
        <div style={{ marginTop:6, opacity:0.85 }}>at: {health?.at || "-"} · status: {health?.status ?? "-"}</div>
        <pre style={{ marginTop:10, padding:12, borderRadius:10, overflowX:"auto", background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12 }}>{health?.body || ""}</pre>
      </section>

      <section style={{ marginTop:14, padding:14, borderRadius:12, border:"1px solid rgba(255,255,255,0.10)", background:"rgba(255,255,255,0.03)" }}>
        <div style={{ fontWeight:900 }}>STAGING /api/debug/stamp</div>
        <div style={{ opacity:0.75, fontFamily:"ui-monospace, monospace" }}>{stampUrl || "(missing env)"}</div>
        <div style={{ marginTop:6, opacity:0.85 }}>at: {stamp?.at || "-"} · status: {stamp?.status ?? "-"}</div>
        <pre style={{ marginTop:10, padding:12, borderRadius:10, overflowX:"auto", background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12 }}>{stamp?.body || ""}</pre>
      </section>

      <section style={{ marginTop:14, padding:14, borderRadius:12, border:"1px solid rgba(255,255,255,0.10)", background:"rgba(255,255,255,0.03)" }}>
        <div style={{ fontWeight:900 }}>PROMOTE (manual, guarded)</div>
        <pre style={{ marginTop:10, padding:12, borderRadius:10, overflowX:"auto", background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12 }}>{promoteCmd}</pre>
      </section>
    </main>
  );
}
