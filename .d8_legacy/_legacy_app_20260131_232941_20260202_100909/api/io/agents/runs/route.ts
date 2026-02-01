import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AgentRun = {
  id: string;
  agent: string;
  status: "queued" | "running" | "succeeded" | "failed";
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  summary: string;
};

function mockRuns(): AgentRun[] {
  const now = Date.now();
  return [
    { id: "run_" + (now - 120000).toString(36), agent: "SEO-V2", status: "succeeded",
      startedAt: new Date(now - 120000).toISOString(), finishedAt: new Date(now - 82000).toISOString(), durationMs: 38000,
      summary: "Updated titles + generated 6 keywords." },
    { id: "run_" + (now - 70000).toString(36), agent: "SITEMAP", status: "succeeded",
      startedAt: new Date(now - 70000).toISOString(), finishedAt: new Date(now - 52000).toISOString(), durationMs: 18000,
      summary: "Sitemap rebuilt and queued for upload." },
    { id: "run_" + (now - 30000).toString(36), agent: "CONTENT", status: "running",
      startedAt: new Date(now - 30000).toISOString(),
      summary: "Drafting 2 landing pages + internal links." },
    { id: "run_" + (now - 8000).toString(36), agent: "PIPELINE", status: "queued",
      startedAt: new Date(now - 8000).toISOString(),
      summary: "Waiting for prerequisites (SEO-V2, CONTENT)." },
  ];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ts = url.searchParams.get("ts") || "";
  const runs = mockRuns();

  return NextResponse.json({
    ok: true,
    patch: "ROCKET_COCKPIT_IO_v1_20260131",
    at: new Date().toISOString(),
    ts,
    runs
  }, {
    headers: {
      "cache-control": "no-store",
      "x-d8io-patch": "ROCKET_COCKPIT_IO_v1_20260131",
      "x-d8io-surface": "rocket-cockpit",
      "x-d8io-count": String(runs.length)
    }
  });
}