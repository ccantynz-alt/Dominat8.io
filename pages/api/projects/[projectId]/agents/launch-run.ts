import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Launch Run orchestrator (Pages API)
 *
 * POST /api/projects/:projectId/agents/launch-run
 *   Runs: finish-for-me -> conversion -> seo-v2 -> sitemap -> publish
 *   Writes a job record to KV (best-effort; does not hard fail if KV is unavailable)
 *
 * GET /api/projects/:projectId/agents/launch-run
 *   Returns last job record (or specific job via ?jobId=)
 */

type StepName =
  | "finish-for-me"
  | "conversion"
  | "seo-v2"
  | "sitemap"
  | "publish";

type StepResult = {
  step: StepName;
  ok: boolean;
  status: number;
  ms: number;
  contentType: string;
  bodyFirst200: string;
  url: string;
  error?: string;
};

type JobRecord = {
  ok: boolean;
  jobId: string;
  projectId: string;
  createdAtIso: string;
  finishedAtIso?: string;
  status: "running" | "ok" | "failed";
  steps: StepResult[];
  config: {
    timeoutMs: number;
    targetCount?: number;
    chunkSize?: number;
    runFinishForMe: boolean;
    runConversion: boolean;
    runSeoV2: boolean;
    runSitemap: boolean;
    runPublish: boolean;
  };
};

function getProjectId(req: NextApiRequest): string | null {
  const raw = req.query?.projectId;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return String(raw);
}

function getBaseUrl(req: NextApiRequest): string {
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    (req.headers["host"] as string) ||
    "";
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  return `${proto}://${host}`;
}

function parseIntParam(v: any): number | undefined {
  if (v === undefined || v === null) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(String(s));
  if (!Number.isFinite(n)) return undefined;
  return Math.floor(n);
}

function parseBoolParam(v: any, defaultValue: boolean): boolean {
  if (v === undefined || v === null) return defaultValue;
  const s = (Array.isArray(v) ? v[0] : v).toString().trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return defaultValue;
}

function getTimeoutMs(): number {
  const raw = (process.env.PIPELINE_STEP_TIMEOUT_MS || "20000").trim();
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 20000;
  return Math.min(Math.max(n, 1000), 120000);
}

function newJobId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `launch_${Date.now()}_${rand}`;
}

async function loadKvBestEffort(): Promise<any | null> {
  // Best-effort KV loader: avoids hard build failures if the import path differs.
  // Your repo previously had src/app/lib/kv.ts — this targets that path.
  try {
    const mod: any = await import("../../../../../src/app/lib/kv");
    return mod?.kv || mod?.default || mod || null;
  } catch {
    return null;
  }
}

async function kvSetBestEffort(kv: any, key: string, value: any): Promise<void> {
  if (!kv) return;
  const v = typeof value === "string" ? value : JSON.stringify(value);
  // Support common KV client shapes:
  // - kv.set(key, value)
  // - kv.json.set(key, "$", value) (Upstash Redis JSON)
  try {
    if (typeof kv.set === "function") {
      await kv.set(key, v);
      return;
    }
  } catch {}
  try {
    if (kv.json && typeof kv.json.set === "function") {
      await kv.json.set(key, "$", value);
      return;
    }
  } catch {}
}

async function kvGetBestEffort(kv: any, key: string): Promise<any | null> {
  if (!kv) return null;
  try {
    if (typeof kv.get === "function") {
      return await kv.get(key);
    }
  } catch {}
  try {
    if (kv.json && typeof kv.json.get === "function") {
      return await kv.json.get(key, "$");
    }
  } catch {}
  return null;
}

async function runStep(args: {
  req: NextApiRequest;
  projectId: string;
  baseUrl: string;
  timeoutMs: number;
  step: StepName;
  targetCount?: number;
  chunkSize?: number;
}): Promise<StepResult> {
  const { req, projectId, baseUrl, timeoutMs, step, targetCount, chunkSize } =
    args;

  const ts = Date.now();
  let url = "";

  if (step === "publish") {
    url = `${baseUrl}/api/projects/${encodeURIComponent(
      projectId
    )}/publish?ts=${ts}`;
  } else {
    const qp: string[] = [`ts=${ts}`];
    if (step === "seo-v2" || step === "sitemap") {
      if (typeof targetCount === "number") qp.push(`targetCount=${targetCount}`);
      if (typeof chunkSize === "number") qp.push(`chunkSize=${chunkSize}`);
    }
    url = `${baseUrl}/api/projects/${encodeURIComponent(
      projectId
    )}/agents/${encodeURIComponent(step)}?${qp.join("&")}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const started = Date.now();
  try {
    const headers: Record<string, string> = {
      "x-launch-run": "1",
    };

    // Forward cookies if present (helps if any agent expects auth/session cookie).
    // Safe even if not used.
    const cookie = req.headers["cookie"];
    if (cookie) headers["cookie"] = String(cookie);

    // Use JSON by default for POST.
    headers["content-type"] = "application/json";

    const r = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    const ms = Date.now() - started;
    const ct = r.headers.get("content-type") || "";
    const text = await r.text().catch(() => "");
    const ok = r.status >= 200 && r.status < 300;

    return {
      step,
      ok,
      status: r.status,
      ms,
      contentType: ct,
      bodyFirst200: text.slice(0, 200),
      url,
    };
  } catch (err: any) {
    const ms = Date.now() - started;
    const msg =
      err?.name === "AbortError"
        ? "timeout_abort"
        : err?.message || String(err);

    return {
      step,
      ok: false,
      status: 0,
      ms,
      contentType: "",
      bodyFirst200: "",
      url,
      error: msg,
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = getProjectId(req);
  if (!projectId) {
    res.status(400).json({ ok: false, error: "Missing projectId" });
    return;
  }

  const kv = await loadKvBestEffort();
  const baseUrl = getBaseUrl(req);

  // GET: return last job (or jobId=)
  if ((req.method || "").toUpperCase() === "GET") {
    const jobIdParam = req.query?.jobId;
    const jobId =
      jobIdParam === undefined || jobIdParam === null
        ? null
        : Array.isArray(jobIdParam)
        ? jobIdParam[0] ?? null
        : String(jobIdParam);

    const lastKey = `project:${projectId}:launch:lastJobId`;

    let readJobId = jobId;
    if (!readJobId) {
      const last = await kvGetBestEffort(kv, lastKey);
      readJobId = typeof last === "string" ? last : null;
    }

    if (!readJobId) {
      res.status(200).json({
        ok: true,
        projectId,
        message: "No launch job found yet",
        lastJobId: null,
      });
      return;
    }

    const jobKey = `job:${readJobId}`;
    const jobRaw = await kvGetBestEffort(kv, jobKey);

    // If KV returns a JSON string, parse it.
    let job: any = jobRaw;
    if (typeof jobRaw === "string") {
      try {
        job = JSON.parse(jobRaw);
      } catch {
        job = jobRaw;
      }
    }

    res.status(200).json({
      ok: true,
      projectId,
      jobId: readJobId,
      job,
      source: kv ? "kv" : "kv_unavailable",
    });
    return;
  }

  // POST: run launch sequence
  if ((req.method || "").toUpperCase() !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  const timeoutMs = getTimeoutMs();

  // Query toggles (defaults ON)
  const runFinishForMe = parseBoolParam(req.query?.runFinishForMe, true);
  const runConversion = parseBoolParam(req.query?.runConversion, true);
  const runSeoV2 = parseBoolParam(req.query?.runSeoV2, true);
  const runSitemap = parseBoolParam(req.query?.runSitemap, true);
  const runPublish = parseBoolParam(req.query?.runPublish, true);

  const targetCount = parseIntParam(req.query?.targetCount);
  const chunkSize = parseIntParam(req.query?.chunkSize);

  const jobId = newJobId();
  const createdAtIso = new Date().toISOString();

  const job: JobRecord = {
    ok: true,
    jobId,
    projectId,
    createdAtIso,
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

  const jobKey = `job:${jobId}`;
  const lastKey = `project:${projectId}:launch:lastJobId`;

  // Write "running" job immediately (best-effort)
  await kvSetBestEffort(kv, jobKey, job);
  await kvSetBestEffort(kv, lastKey, jobId);

  console.log("[LAUNCH-RUN] start", {
    projectId,
    jobId,
    timeoutMs,
    targetCount,
    chunkSize,
    baseUrl,
  });

  const stepsToRun: StepName[] = [];
  if (runFinishForMe) stepsToRun.push("finish-for-me");
  if (runConversion) stepsToRun.push("conversion");
  if (runSeoV2) stepsToRun.push("seo-v2");
  if (runSitemap) stepsToRun.push("sitemap");
  if (runPublish) stepsToRun.push("publish");

  for (const step of stepsToRun) {
    const result = await runStep({
      req,
      projectId,
      baseUrl,
      timeoutMs,
      step,
      targetCount,
      chunkSize,
    });

    job.steps.push(result);

    // Persist after each step (best-effort)
    await kvSetBestEffort(kv, jobKey, job);

    console.log("[LAUNCH-RUN] step", {
      projectId,
      jobId,
      step: result.step,
      ok: result.ok,
      status: result.status,
      ms: result.ms,
      error: result.error,
    });

    // Stop early on failure
    if (!result.ok) {
      job.status = "failed";
      job.finishedAtIso = new Date().toISOString();
      await kvSetBestEffort(kv, jobKey, job);
      console.log("[LAUNCH-RUN] failed", { projectId, jobId });
      res.status(200).json(job);
      return;
    }
  }

  job.status = "ok";
  job.finishedAtIso = new Date().toISOString();
  await kvSetBestEffort(kv, jobKey, job);

  console.log("[LAUNCH-RUN] done", { projectId, jobId });
  res.status(200).json(job);
}
