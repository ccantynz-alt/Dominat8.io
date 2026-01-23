// pages/api/projects/[projectId]/agents/launch-run.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "../../../../../src/lib/kv";

function getOrigin(req: NextApiRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  return `${proto}://${host}`;
}

function asNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function makeJobId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `launch_${Date.now()}_${rand}`;
}

type StepRecord = {
  step: string;
  ok: boolean;
  status: number;
  ms?: number;
  contentType?: string;
  bodyFirst200?: string;
  url?: string;
};

type JobRecord = {
  ok: true;
  jobId: string;
  projectId: string;
  createdAtIso: string;
  status: "running" | "failed" | "complete";
  steps: StepRecord[];
  config: {
    timeoutMs: number;
    targetCount: number;
    chunkSize: number;
    runFinishForMe: boolean;
    runConversion: boolean;
    runSeoV2: boolean;
    runSitemap: boolean;
    runPublish: boolean;
  };
};

async function callAgent(
  url: string,
  method: "POST" | "GET",
  timeoutMs: number
): Promise<{ ok: boolean; status: number; ct: string; text: string; ms: number }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method, cache: "no-store", signal: ctrl.signal });
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    return { ok: res.ok, status: res.status, ct, text, ms: Date.now() - started };
  } finally {
    clearTimeout(t);
  }
}

function safeParseJson<T>(raw: any, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const origin = getOrigin(req);

  const timeoutMs = asNumber(req.query.timeoutMs, 20000);
  const targetCount = asNumber(req.query.targetCount, 5000);
  const chunkSize = asNumber(req.query.chunkSize, 500);

  const runFinishForMe = true;
  const runConversion = false;
  const runSeoV2 = true;
  const runSitemap = true;
  const runPublish = true;

  const jobId = makeJobId();
  const nowIso = new Date().toISOString();

  const jobKey = `job:${jobId}`;
  const lastJobKey = `project:${projectId}:pipeline:lastJobId`;
  const jobListKey = `project:${projectId}:pipeline:jobIds`;

  const job: JobRecord = {
    ok: true,
    jobId,
    projectId,
    createdAtIso: nowIso,
    status: "running",
    steps: [],
    config: {
      timeoutMs,
      targetCount,
      chunkSize,
      runFinishForMe,
      runConversion,
      runSeoV2,
      runSitemap,
      runPublish,
    },
  };

  async function persist() {
    // kv.set expects strings in this repo
    await kv.set(jobKey, JSON.stringify(job));
  }

  // âœ… Persist immediately
  await persist();

  // âœ… Pointer + fallback list (newest-first)
  await kv.set(lastJobKey, jobId);

  const prevRaw = await kv.get(jobListKey);
  const prev = safeParseJson<string[]>(prevRaw, []);
  const next = [jobId, ...prev.filter((x) => x !== jobId)].slice(0, 50);
  await kv.set(jobListKey, JSON.stringify(next));

  async function runStep(name: string, url: string, method: "POST" | "GET") {
    const r = await callAgent(url, method, timeoutMs);
    const step: StepRecord = {
      step: name,
      ok: r.ok,
      status: r.status,
      ms: r.ms,
      contentType: r.ct,
      bodyFirst200: (r.text || "").slice(0, 200),
      url,
    };
    job.steps.push(step);
    await persist();

    if (!r.ok) {
      job.status = "failed";
      await persist();
      return false;
    }
    return true;
  }

  try {
    if (runFinishForMe) {
      const url = `${origin}/api/projects/${projectId}/agents/finish-for-me?ts=${Date.now()}`;
      const ok = await runStep("finish-for-me", url, "POST");
      if (!ok) return res.status(200).json(job);
    }

    if (runConversion) {
      const url = `${origin}/api/projects/${projectId}/agents/conversion?ts=${Date.now()}`;
      const ok = await runStep("conversion", url, "POST");
      if (!ok) return res.status(200).json(job);
    }

    if (runSeoV2) {
      const url = `${origin}/api/projects/${projectId}/agents/seo-v2?targetCount=${targetCount}&chunkSize=${chunkSize}&ts=${Date.now()}`;
      const ok = await runStep("seo-v2", url, "POST");
      if (!ok) return res.status(200).json(job);
    }

    if (runSitemap) {
      const url = `${origin}/api/projects/${projectId}/agents/sitemap?ts=${Date.now()}`;
      const ok = await runStep("sitemap", url, "POST");
      if (!ok) return res.status(200).json(job);
    }

    if (runPublish) {
      const url = `${origin}/api/projects/${projectId}/publish?ts=${Date.now()}`;
      const ok = await runStep("publish", url, "POST");
      if (!ok) return res.status(200).json(job);
    }

    job.status = "complete";
    await persist();
    return res.status(200).json(job);
  } catch (e: any) {
    job.status = "failed";
    job.steps.push({
      step: "launch-run",
      ok: false,
      status: 500,
      contentType: "application/json",
      bodyFirst200: (e?.message || "Unknown error").slice(0, 200),
    });
    await persist();
    return res.status(200).json(job);
  }
}

