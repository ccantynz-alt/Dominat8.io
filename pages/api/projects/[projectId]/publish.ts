import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

type RunStatus = "running" | "success" | "error";

type RunStep = {
  name: string;
  ok: boolean;
  status: "running" | "success" | "error";
  startedAtIso: string;
  endedAtIso?: string;
  ms?: number;
  error?: string;
};

type RunState = {
  ok: boolean;
  projectId: string;
  status: RunStatus;
  preset: "seo" | "full" | "publish";
  options: {
    seed: boolean;
    runSeoV2: boolean;
    runFinishForMe: boolean;
    runSitemap: boolean;
    autoPublish: boolean;
  };
  startedAtIso: string;
  endedAtIso?: string;
  steps: RunStep[];
};

function nowIso() {
  return new Date().toISOString();
}

function getBaseUrl(req: NextApiRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  return `${proto}://${host}`;
}

function normalizeQueryString(input: string | string[] | undefined): string | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  return input || null;
}

function runKey(projectId: string) {
  return `run:project:${projectId}:latest`;
}

async function writeRunState(projectId: string, state: RunState) {
  await kv.set(runKey(projectId), state);
}

/**
 * Canonical pipeline endpoint (Pages API)
 *
 * POST /api/projects/:projectId/publish
 * Body:
 *  - { preset: "seo" | "full" | "publish" }
 *  - OR explicit options:
 *      { seed?: boolean, runSeoV2?: boolean, runFinishForMe?: boolean, runSitemap?: boolean, autoPublish?: boolean }
 *
 * Writes live state to KV:
 *  run:project:<projectId>:latest
 */
export default async function publish(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const projectId = normalizeQueryString(req.query.projectId);
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  // ✅ Force a non-null string for all closures
  const pid: string = projectId;

  const body = (req.body ?? {}) as any;

  const presetRaw = (body.preset ?? "full") as string;
  const preset: "seo" | "full" | "publish" =
    presetRaw === "seo" || presetRaw === "publish" ? presetRaw : "full";

  // Preset defaults
  const presetDefaults: RunState["options"] =
    preset === "seo"
      ? {
          seed: true,
          runSeoV2: true,
          runFinishForMe: false,
          runSitemap: true,
          autoPublish: false,
        }
      : preset === "publish"
      ? {
          seed: true,
          runSeoV2: true,
          runFinishForMe: true,
          runSitemap: true,
          autoPublish: true,
        }
      : {
          seed: true,
          runSeoV2: true,
          runFinishForMe: true,
          runSitemap: true,
          autoPublish: false,
        };

  // Explicit overrides (if provided)
  const options: RunState["options"] = {
    seed: typeof body.seed === "boolean" ? body.seed : presetDefaults.seed,
    runSeoV2:
      typeof body.runSeoV2 === "boolean" ? body.runSeoV2 : presetDefaults.runSeoV2,
    runFinishForMe:
      typeof body.runFinishForMe === "boolean"
        ? body.runFinishForMe
        : presetDefaults.runFinishForMe,
    runSitemap:
      typeof body.runSitemap === "boolean" ? body.runSitemap : presetDefaults.runSitemap,
    autoPublish:
      typeof body.autoPublish === "boolean" ? body.autoPublish : presetDefaults.autoPublish,
  };

  const baseUrl = getBaseUrl(req);

  const startedAtIso = nowIso();
  const state: RunState = {
    ok: true,
    projectId: pid,
    status: "running",
    preset,
    options,
    startedAtIso,
    steps: [],
  };

  // Write initial state immediately
  try {
    await writeRunState(pid, state);
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "KV write failed (initial run state)",
      details: String(e?.message || e),
      projectId: pid,
      nowIso: nowIso(),
    });
  }

  async function callStep(name: string, path: string, method: "POST" | "GET" = "POST") {
    const step: RunStep = {
      name,
      ok: false,
      status: "running",
      startedAtIso: nowIso(),
    };

    state.steps.push(step);
    await writeRunState(pid, state);

    const t0 = Date.now();
    try {
      const url = `${baseUrl}${path}${path.includes("?") ? "&" : "?"}ts=${Date.now()}`;

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const ct = r.headers.get("content-type") || "";
      let payload: any = null;

      if (ct.includes("application/json")) {
        payload = await r.json();
      } else {
        const text = await r.text();
        payload = { nonJson: true, status: r.status, contentType: ct, text: text?.slice(0, 2000) };
      }

      if (!r.ok || payload?.ok === false) {
        const msg =
          payload?.error ||
          payload?.message ||
          `HTTP ${r.status} from ${path} (${ct || "no content-type"})`;
        step.ok = false;
        step.status = "error";
        step.error = String(msg);
      } else {
        step.ok = true;
        step.status = "success";
      }

      step.endedAtIso = nowIso();
      step.ms = Date.now() - t0;

      await writeRunState(pid, state);

      if (!step.ok) {
        throw new Error(step.error || `${name} failed`);
      }

      return payload;
    } catch (e: any) {
      step.ok = false;
      step.status = "error";
      step.error = step.error || String(e?.message || e);
      step.endedAtIso = nowIso();
      step.ms = Date.now() - t0;

      await writeRunState(pid, state);
      throw e;
    }
  }

  try {
    const results: any[] = [];

    if (options.seed) {
      results.push(await callStep("seed-spec", `/api/projects/${pid}/seed-spec`, "POST"));
    }

    if (options.runSeoV2) {
      results.push(await callStep("seo-v2", `/api/projects/${pid}/agents/seo-v2`, "POST"));
    }

    if (options.runFinishForMe) {
      results.push(await callStep("finish-for-me", `/api/projects/${pid}/agents/finish-for-me`, "POST"));
    }

    if (options.runSitemap) {
      results.push(await callStep("sitemap", `/api/projects/${pid}/agents/sitemap`, "POST"));
    }

    if (options.autoPublish) {
      results.push(await callStep("auto-publish", `/api/projects/${pid}/agents/auto-publish`, "POST"));
    }

    state.status = "success";
    state.endedAtIso = nowIso();
    await writeRunState(pid, state);

    return res.status(200).json({
      ok: true,
      source: "pages/api/projects/[projectId]/publish.ts",
      projectId: pid,
      nowIso: nowIso(),
      runId: `run_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      preset,
      options,
      startedAtIso,
      endedAtIso: state.endedAtIso,
      steps: state.steps,
      results,
    });
  } catch (e: any) {
    state.status = "error";
    state.endedAtIso = nowIso();
    await writeRunState(pid, state);

    return res.status(500).json({
      ok: false,
      source: "pages/api/projects/[projectId]/publish.ts",
      error: String(e?.message || e),
      projectId: pid,
      nowIso: nowIso(),
      preset,
      options,
      startedAtIso,
      endedAtIso: state.endedAtIso,
      steps: state.steps,
    });
  }
}

