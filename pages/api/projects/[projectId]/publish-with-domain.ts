import type { NextApiRequest, NextApiResponse } from "next";

const MARKER = "CANON_publish_with_domain_v1_2026-01-22";

type Step = {
  step: string;
  ok: boolean;
  status: number;
  ms: number;
  url: string;
  matchedPath?: string | null;
  contentType?: string | null;
  bodyFirst200?: string;
};

function nowMs() {
  return Date.now();
}

function first200(s: string) {
  if (!s) return "";
  return s.length <= 200 ? s : s.slice(0, 200);
}

function getBaseUrl(req: NextApiRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  return `${proto}://${host}`;
}

async function callText(url: string, init: RequestInit) {
  const r = await fetch(url, init);
  const text = await r.text();
  const matchedPath = (r.headers.get("x-matched-path") || r.headers.get("X-Matched-Path")) ?? null;
  const contentType = r.headers.get("content-type");
  return { status: r.status, matchedPath, contentType, text };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const started = nowMs();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed", marker: MARKER, method: req.method });
  }

  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId", marker: MARKER });
  }

  const baseUrl = getBaseUrl(req);
  const bodyAny = (req.body ?? {}) as any;

  const host = typeof bodyAny.host === "string" ? bodyAny.host.trim() : undefined;
  const targetCount = Number.isFinite(Number(bodyAny.targetCount)) ? Number(bodyAny.targetCount) : undefined;
  const chunkSize = Number.isFinite(Number(bodyAny.chunkSize)) ? Number(bodyAny.chunkSize) : undefined;

  const steps: Step[] = [];

  try {
    // STEP 0 (optional): Activate domain mapping (server-side admin key)
    if (host) {
      const adminKey = process.env.ADMIN_API_KEY;
      if (!adminKey) {
        return res.status(500).json({
          ok: false,
          marker: MARKER,
          projectId,
          error: "Missing env ADMIN_API_KEY (required to activate host mapping)",
        });
      }

      const url = `${baseUrl}/api/domains/activate?ts=${Date.now()}`;
      const t0 = nowMs();
      const out = await callText(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ host, projectId }),
      });

      steps.push({
        step: "activate-domain",
        ok: out.status >= 200 && out.status < 300,
        status: out.status,
        ms: nowMs() - t0,
        url,
        matchedPath: out.matchedPath,
        contentType: out.contentType,
        bodyFirst200: first200(out.text),
      });

      if (!(out.status >= 200 && out.status < 300)) {
        return res.status(502).json({ ok: false, marker: MARKER, projectId, error: "activate-domain failed", steps });
      }
    }

    // STEP 1: Run pipeline
    {
      const url = `${baseUrl}/api/projects/${projectId}/agents/pipeline?ts=${Date.now()}`;
      const t0 = nowMs();
      const out = await callText(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(Number.isFinite(targetCount) ? { targetCount } : {}),
          ...(Number.isFinite(chunkSize) ? { chunkSize } : {}),
        }),
      });

      steps.push({
        step: "pipeline",
        ok: out.status >= 200 && out.status < 300,
        status: out.status,
        ms: nowMs() - t0,
        url,
        matchedPath: out.matchedPath,
        contentType: out.contentType,
        bodyFirst200: first200(out.text),
      });

      if (!(out.status >= 200 && out.status < 300)) {
        return res.status(502).json({ ok: false, marker: MARKER, projectId, error: "pipeline failed", steps });
      }
    }

    // STEP 2: Publish
    {
      const url = `${baseUrl}/api/projects/${projectId}/publish?ts=${Date.now()}`;
      const t0 = nowMs();
      const out = await callText(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      steps.push({
        step: "publish",
        ok: out.status >= 200 && out.status < 300,
        status: out.status,
        ms: nowMs() - t0,
        url,
        matchedPath: out.matchedPath,
        contentType: out.contentType,
        bodyFirst200: first200(out.text),
      });

      if (!(out.status >= 200 && out.status < 300)) {
        return res.status(502).json({ ok: false, marker: MARKER, projectId, error: "publish failed", steps });
      }
    }

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      projectId,
      host: host || null,
      msTotal: nowMs() - started,
      steps,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      marker: MARKER,
      projectId,
      error: err?.message || String(err),
      steps,
    });
  }
}