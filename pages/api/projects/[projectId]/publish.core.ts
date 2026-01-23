import type { NextApiRequest, NextApiResponse } from "next";

type AnyHandler = (req: NextApiRequest, res: NextApiResponse) => any;

function getProjectIdFromReq(req: NextApiRequest): string | null {
  const raw = req.query?.projectId;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return String(raw);
}

function getBaseUrl(req: NextApiRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers["host"] as string) || "";
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  // Fallback: Vercel prod generally sets x-forwarded-*; host should exist.
  return `${proto}://${host}`;
}

async function loadCoreHandler(): Promise<AnyHandler> {
  // Support both ESM default export and CommonJS module.exports patterns.
  // Also allow named exports in case publish.core.ts exports { handler }.
  const mod: any = await import("./publish.core");
  return (mod?.default || mod?.handler || mod) as AnyHandler;
}

function shouldAutoRunPipeline(req: NextApiRequest): boolean {
  // Default ON unless explicitly disabled.
  const flag = (process.env.AUTO_PIPELINE_ON_PUBLISH || "1").trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;

  // Only on POST publishes.
  if ((req.method || "").toUpperCase() !== "POST") return false;

  return true;
}

function getTimeoutMs(): number {
  const raw = process.env.PIPELINE_STEP_TIMEOUT_MS || "20000";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 20000;
  return Math.min(Math.max(n, 1000), 120000);
}

async function triggerPipelineFireAndForget(req: NextApiRequest): Promise<void> {
  const projectId = getProjectIdFromReq(req);
  if (!projectId) {
    console.log("[AUTO-PIPELINE] skip: missing projectId");
    return;
  }

  const baseUrl = getBaseUrl(req);
  const url = `${baseUrl}/api/projects/${encodeURIComponent(projectId)}/agents/pipeline?ts=${Date.now()}`;

  const timeoutMs = getTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log("[AUTO-PIPELINE] start", { projectId, timeoutMs });

    const r = await fetch(url, {
      method: "POST",
      headers: {
        // Ensure it's treated as a server-to-server request.
        "content-type": "application/json",
        "x-auto-pipeline": "1",
      },
      // No body needed unless you want defaults on the pipeline side.
      // If you WANT to pass defaults, do it there (pipeline.ts) or add here later.
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    const ct = r.headers.get("content-type") || "";
    const text = await r.text().catch(() => "");
    console.log("[AUTO-PIPELINE] done", {
      projectId,
      status: r.status,
      contentType: ct,
      bodyFirst200: text.slice(0, 200),
    });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "timeout_abort" : (err?.message || String(err));
    console.log("[AUTO-PIPELINE] failed", { projectId, msg });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const core = await loadCoreHandler();

  // Hook res.end so we can trigger pipeline AFTER the response is fully sent.
  // This avoids blocking publish and avoids changing response behavior.
  const shouldRun = shouldAutoRunPipeline(req);

  const originalEnd = res.end.bind(res);
  let fired = false;

  (res as any).end = ((...args: any[]) => {
    try {
      return originalEnd(...args);
    } finally {
      if (shouldRun && !fired) {
        fired = true;
        // Run async without awaiting (true fire-and-forget)
        void triggerPipelineFireAndForget(req);
      }
    }
  }) as any;

  // Delegate to original publish logic (unchanged).
  return core(req, res);
}
