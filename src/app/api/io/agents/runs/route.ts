import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PATCH = "IO_ROCKET_COCKPIT_v2_20260220";

type AgentRun = {
  id: string;
  agent: string;
  status: "queued" | "running" | "succeeded" | "failed";
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  summary: string;
};

// Rotating agents pool — varies with time so the panel feels alive
const AGENT_POOL: Array<Pick<AgentRun, "agent" | "summary">> = [
  { agent: "SEO-SWEEP",    summary: "Title tags and meta descriptions refreshed across 48 pages." },
  { agent: "SITEMAP",      summary: "XML sitemap rebuilt — 312 URLs indexed and queued for Search Console." },
  { agent: "PERF-AUDIT",  summary: "LCP 1.2s, CLS 0.02, FID 18ms — all Core Web Vitals green." },
  { agent: "OG-IMAGES",   summary: "Open Graph previews regenerated for 9 gallery entries." },
  { agent: "CONTENT-GEN", summary: "Blog post drafted: 10 AI website trends for 2026." },
  { agent: "SSL-CHECK",   summary: "Certificate valid — expires in 89 days, auto-renewal confirmed." },
  { agent: "DEPLOY-V2",   summary: "CDN cache purged and assets re-propagated to 18 edge nodes." },
  { agent: "LINK-SCAN",   summary: "No broken links found across 312 crawled URLs." },
  { agent: "AB-TEST",     summary: "Variant B headline outperforming control by 14% CTR — promoted to primary." },
  { agent: "SCHEMA-ORG",  summary: "Structured data injected: Organization, WebSite, BreadcrumbList." },
];

function mockRuns(): AgentRun[] {
  const now = Date.now();
  // Use time to deterministically rotate visible agents
  const slot = Math.floor(now / 15000) % AGENT_POOL.length;

  const runs: AgentRun[] = [];

  // 2 recent succeeded runs
  for (let i = 0; i < 2; i++) {
    const idx = (slot + i) % AGENT_POOL.length;
    const ago = 90000 + i * 55000;
    const duration = 12000 + (idx * 3700) % 40000;
    runs.push({
      id: "run_" + (now - ago).toString(36),
      agent: AGENT_POOL[idx].agent,
      status: "succeeded",
      summary: AGENT_POOL[idx].summary,
      startedAt: new Date(now - ago).toISOString(),
      finishedAt: new Date(now - ago + duration).toISOString(),
      durationMs: duration,
    });
  }

  // 1 currently running
  const runningIdx = (slot + 2) % AGENT_POOL.length;
  runs.push({
    id: "run_" + (now - 22000).toString(36),
    agent: AGENT_POOL[runningIdx].agent,
    status: "running",
    summary: AGENT_POOL[runningIdx].summary.split(" ").slice(0, 5).join(" ") + "…",
    startedAt: new Date(now - 22000).toISOString(),
  });

  // 1 queued
  const queuedIdx = (slot + 3) % AGENT_POOL.length;
  runs.push({
    id: "run_" + (now - 4000).toString(36),
    agent: AGENT_POOL[queuedIdx].agent,
    status: "queued",
    summary: "Awaiting scheduler slot.",
    startedAt: new Date(now - 4000).toISOString(),
  });

  return runs;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ts = url.searchParams.get("ts") || "";
  const runs = mockRuns();
  return NextResponse.json(
    { ok: true, patch: PATCH, at: new Date().toISOString(), ts, runs },
    {
      headers: {
        "cache-control": "no-store",
        "x-d8io-patch": PATCH,
        "x-d8io-surface": "rocket-cockpit",
        "x-d8io-count": String(runs.length),
      },
    }
  );
}
