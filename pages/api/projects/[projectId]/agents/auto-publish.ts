import type { NextApiRequest, NextApiResponse } from "next";

type StepLog = {
  name: string;
  ok: boolean;
  ms: number;
  url?: string;
  status?: number;
  ct?: string | null;
  result?: any;
  error?: string | null;
  skipped?: boolean;
  optional?: boolean;
};

function getBaseUrl(req: NextApiRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host;
  return `${proto}://${host}`;
}

async function readJsonSafe(r: Response) {
  const ct = r.headers.get("content-type");
  const text = await r.text();
  try {
    return { ct, text, json: text ? JSON.parse(text) : null };
  } catch {
    return { ct, text, json: null };
  }
}

async function callJsonStep(args: {
  name: string;
  url: string;
  method?: "POST" | "GET";
  body?: any;
}): Promise<StepLog> {
  const { name, url } = args;
  const method = args.method ?? "POST";
  const started = Date.now();

  try {
    const hasBody = args.body !== undefined;
    const r = await fetch(url, {
      method,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(args.body) : undefined,
    });

    const { ct, text, json } = await readJsonSafe(r);
    const ms = Date.now() - started;

    if (!r.ok) {
      return {
        name,
        ok: false,
        ms,
        url,
        status: r.status,
        ct,
        result: json ?? (text ? { raw: text } : null),
        error: `${name} failed: status=${r.status}`,
      };
    }

    return {
      name,
      ok: true,
      ms,
      url,
      status: r.status,
      ct,
      result: json ?? (text ? { raw: text } : null),
      error: null,
    };
  } catch (e: any) {
    const ms = Date.now() - started;
    return {
      name,
      ok: false,
      ms,
      url,
      error: `${name} threw: ${e?.message || String(e)}`,
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed", allow: ["POST"] });
  }

  const projectId = String(req.query.projectId || "");

  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    null;

  const buildTag = "auto-publish-selfheal-20260117-004";

  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const dryRun = body.dryRun === undefined ? true : Boolean(body.dryRun);
  const includeFinishForMe =
    body.includeFinishForMe === undefined ? true : Boolean(body.includeFinishForMe);

  const baseUrl = getBaseUrl(req);

  const routes = {
    audit: `${baseUrl}/api/projects/${projectId}/audit`,
    seo: `${baseUrl}/api/projects/${projectId}/agents/seo`,
    conversion: `${baseUrl}/api/projects/${projectId}/agents/conversion`,
    finishForMe: `${baseUrl}/api/projects/${projectId}/agents/finish-for-me`,
    seedSpec: `${baseUrl}/api/projects/${projectId}/seed-spec`,
    publish: `${baseUrl}/api/projects/${projectId}/publish`,
  };

  const steps: StepLog[] = [];

  // 🔹 AUDIT — OPTIONAL, SKIPPED IF MISSING
  const audit = await callJsonStep({ name: "audit", url: routes.audit, method: "POST" });

  if (!audit.ok && (audit.status === 404 || audit.status === 405)) {
    steps.push({
      name: "audit",
      ok: true,
      skipped: true,
      optional: true,
      ms: audit.ms,
      error: null,
      result: { skipped: true, reason: `audit route missing (${audit.status})` },
    });
  } else {
    steps.push({ ...audit, optional: true });
  }

  // SEO (optional)
  steps.push({ ...(await callJsonStep({ name: "seo", url: routes.seo })), optional: true });

  // Conversion (optional)
  steps.push({ ...(await callJsonStep({ name: "conversion", url: routes.conversion })), optional: true });

  // Finish-for-me (optional)
  if (includeFinishForMe) {
    steps.push({
      ...(await callJsonStep({ name: "finish-for-me", url: routes.finishForMe })),
      optional: true,
    });
  } else {
    steps.push({
      name: "finish-for-me",
      ok: true,
      skipped: true,
      optional: true,
      ms: 0,
      result: { skipped: true, reason: "includeFinishForMe=false" },
    });
  }

  // DRY RUN
  if (dryRun) {
    steps.push({
      name: "publish",
      ok: true,
      skipped: true,
      ms: 0,
      result: { skipped: true, reason: "dryRun=true" },
    });

    return res.status(200).json({
      ok: true,
      projectId,
      agent: "auto-publish",
      dryRun,
      includeFinishForMe,
      buildTag,
      gitSha,
      steps,
    });
  }

  // REAL PUBLISH
  let publishStep = await callJsonStep({ name: "publish", url: routes.publish });

  const missingSpec =
    publishStep.status === 400 &&
    String(publishStep.result?.error || "").includes("No site spec");

  if (!publishStep.ok && missingSpec) {
    steps.push(publishStep);

    const seed = await callJsonStep({ name: "seed-spec", url: routes.seedSpec });
    steps.push(seed);

    if (!seed.ok) {
      return res.status(500).json({ ok: false, projectId, agent: "auto-publish", buildTag, gitSha, steps });
    }

    const retry = await callJsonStep({ name: "publish-retry", url: routes.publish });
    steps.push(retry);

    if (!retry.ok) {
      return res.status(500).json({ ok: false, projectId, agent: "auto-publish", buildTag, gitSha, steps });
    }

    return res.status(200).json({
      ok: true,
      projectId,
      agent: "auto-publish",
      buildTag,
      gitSha,
      publicUrl: retry.result?.publicUrl || null,
      publishedAtIso: retry.result?.publishedAtIso || null,
      steps,
    });
  }

  steps.push(publishStep);

  if (!publishStep.ok) {
    return res.status(500).json({ ok: false, projectId, agent: "auto-publish", buildTag, gitSha, steps });
  }

  return res.status(200).json({
    ok: true,
    projectId,
    agent: "auto-publish",
    buildTag,
    gitSha,
    publicUrl: publishStep.result?.publicUrl || null,
    publishedAtIso: publishStep.result?.publishedAtIso || null,
    steps,
  });
}
