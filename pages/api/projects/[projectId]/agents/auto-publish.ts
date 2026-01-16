// FILE: pages/api/projects/[projectId]/agents/auto-publish.ts
import type { NextApiRequest, NextApiResponse } from "next";

type StepResult = {
  name: "audit" | "seo" | "conversion" | "finish-for-me" | "publish";
  ok: boolean;
  ms: number;
  status?: number;
  ct?: string | null;
  bodyText?: string;
  json?: any;
  error?: string | null;
  note?: string;
};

const BUILD_TAG = "auto-publish-selfheal-20260117-001"; // <- bump this any time you redeploy
const isNoSpecError = (text: string) =>
  /No site spec found to publish/i.test(text || "");

function getBaseUrl(req: NextApiRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

async function callApi(
  baseUrl: string,
  path: string,
  init?: { method?: string; jsonBody?: any }
) {
  const method = init?.method || "POST";
  const headers: Record<string, string> = {};

  let body: string | undefined = undefined;
  if (init?.jsonBody !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.jsonBody);
  }

  const t0 = Date.now();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body,
    cache: "no-store",
  });
  const ms = Date.now() - t0;

  const ct = res.headers.get("content-type");
  const bodyText = await res.text();

  let json: any = undefined;
  if (ct && ct.includes("application/json")) {
    try {
      json = JSON.parse(bodyText);
    } catch {
      // leave json undefined if parsing fails
    }
  }

  return { res, ms, ct, bodyText, json };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed", allow: ["POST"] });
  }

  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  // Body can be empty; default to safe behavior.
  const dryRun = req.body?.dryRun === false ? false : true;
  const includeFinishForMe =
    req.body?.includeFinishForMe === false ? false : true;

  const baseUrl = getBaseUrl(req);
  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    null;

  const steps: StepResult[] = [];

  // Helper to run a step that calls an internal endpoint.
  const runStep = async (
    name: StepResult["name"],
    path: string,
    options?: { jsonBody?: any; method?: string }
  ) => {
    const step: StepResult = { name, ok: false, ms: 0, error: null };
    try {
      const out = await callApi(baseUrl, path, {
        method: options?.method || "POST",
        jsonBody: options?.jsonBody,
      });

      step.ms = out.ms;
      step.status = out.res.status;
      step.ct = out.ct;
      step.bodyText = out.bodyText;
      step.json = out.json;

      step.ok = out.res.ok && (out.json?.ok !== false);
      if (!step.ok) {
        step.error = `Step failed: status=${out.res.status} ct=${out.ct} body=${out.bodyText}`;
      }
    } catch (e: any) {
      step.ms = step.ms || 0;
      step.ok = false;
      step.error = e?.message || String(e);
    }

    steps.push(step);
    return step;
  };

  // 1) audit
  await runStep("audit", `/api/projects/${projectId}/audit?ts=${Date.now()}`);

  // 2) seo
  await runStep("seo", `/api/projects/${projectId}/agents/seo?ts=${Date.now()}`);

  // 3) conversion
  await runStep(
    "conversion",
    `/api/projects/${projectId}/agents/conversion?ts=${Date.now()}`
  );

  // 4) finish-for-me (optional)
  if (includeFinishForMe) {
    await runStep(
      "finish-for-me",
      `/api/projects/${projectId}/agents/finish-for-me?ts=${Date.now()}`
    );
  } else {
    steps.push({
      name: "finish-for-me",
      ok: true,
      ms: 0,
      note: "Skipped because includeFinishForMe=false",
    });
  }

  // 5) publish
  if (dryRun) {
    steps.push({
      name: "publish",
      ok: true,
      ms: 0,
      note: "Skipped because dryRun=true",
    });

    return res.status(200).json({
      ok: true,
      projectId,
      agent: "auto-publish",
      buildTag: BUILD_TAG,
      gitSha,
      includeFinishForMe,
      dryRun,
      steps,
    });
  }

  // Real publish (with self-healing if spec is missing)
  const publishOnce = async () =>
    runStep("publish", `/api/projects/${projectId}/publish?ts=${Date.now()}`);

  let publishStep = await publishOnce();

  // Self-heal: if publish fails due to missing spec, seed and retry once.
  if (!publishStep.ok) {
    const bodyText = publishStep.bodyText || "";
    const jsonError = publishStep.json?.error ? String(publishStep.json.error) : "";
    const combined = `${jsonError}\n${bodyText}`;

    if (isNoSpecError(combined)) {
      // attempt seed-spec
      const seed = await runStep(
        "publish",
        `/api/projects/${projectId}/seed-spec?ts=${Date.now()}`
      );

      // Overwrite the "seed" step name to be explicit (keep as separate record)
      // We can’t change the union type above without widening; so we store as publish step with note.
      seed.note = "Self-heal: seeded spec because publish had no site spec";

      // retry publish once
      publishStep = await publishOnce();

      // If retry worked, annotate the successful publish step
      if (publishStep.ok) {
        publishStep.note = "Self-heal: publish succeeded after seed-spec";
      }
    }
  }

  const ok = steps.every((s) => s.ok);

  // Convenience: surface publish info at top-level if present
  const publishJson = steps
    .filter((s) => s.name === "publish" && s.json && s.json.ok === true)
    .map((s) => s.json)
    .slice(-1)[0];

  return res.status(ok ? 200 : 500).json({
    ok,
    projectId,
    agent: "auto-publish",
    buildTag: BUILD_TAG,
    gitSha,
    includeFinishForMe,
    dryRun,
    publicUrl: publishJson?.publicUrl || null,
    publishedAtIso: publishJson?.publishedAtIso || null,
    steps,
  });
}
