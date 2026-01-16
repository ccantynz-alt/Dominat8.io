// pages/api/projects/[projectId]/agents/auto-publish.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { json, methodNotAllowed, runStep } from "./_runtime";

type Body = {
  includeFinishForMe?: boolean; // default true
  dryRun?: boolean; // default true (does not call real publish yet)
};

function safeJsonParse(input: any): any {
  if (!input) return {};
  if (typeof input === "object") return input;
  try {
    return JSON.parse(String(input));
  } catch {
    return {};
  }
}

async function auditStep(projectId: string) {
  // TODO: Replace stub with real audit logic (KV reads, spec validation, etc.)
  return {
    projectId,
    summary: "Audit OK (stub)",
    issues: [],
    recommendations: [],
  };
}

async function seoStep(projectId: string) {
  // TODO: Replace stub with real SEO logic (generate SEO pages, metadata, sitemap, etc.)
  return {
    projectId,
    summary: "SEO OK (stub)",
    pagesPlanned: ["Home", "About", "Contact"],
    metaPlanned: { title: "Demo Title", description: "Demo Description" },
  };
}

async function conversionStep(projectId: string) {
  // TODO: Replace stub with real conversion logic (CTA copy, sections, pricing blocks, etc.)
  return {
    projectId,
    summary: "Conversion OK (stub)",
    ctas: ["Start Free", "Book a Call", "Get a Quote"],
  };
}

async function finishForMeStep(projectId: string) {
  // TODO: Replace stub with real finish-for-me logic (full site generation / sections)
  return {
    projectId,
    summary: "Finish-for-me OK (stub)",
    changes: ["Hero copy refreshed", "Added FAQ section", "Improved CTA placement"],
  };
}

async function publishStep(projectId: string, dryRun: boolean) {
  if (dryRun) {
    return {
      projectId,
      summary: "Publish skipped (dryRun=true)",
      published: false,
    };
  }

  // OPTIONAL FUTURE:
  // When you confirm the real publish endpoint path, we’ll wire it here.
  // For now we fail loudly so you don’t think you published when you didn’t.
  throw new Error("Publish not wired yet. Set dryRun=true or wire real publish endpoint.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return methodNotAllowed(req, res);

  const projectId = String(req.query.projectId || "");
  const body = safeJsonParse(req.body) as Body;

  const includeFinishForMe = body.includeFinishForMe ?? true;
  const dryRun = body.dryRun ?? true;

  const steps: any[] = [];

  const audit = await runStep("audit", async () => auditStep(projectId));
  steps.push(audit);

  const seo = await runStep("seo", async () => seoStep(projectId));
  steps.push(seo);

  const conversion = await runStep("conversion", async () => conversionStep(projectId));
  steps.push(conversion);

  if (includeFinishForMe) {
    const ffm = await runStep("finish-for-me", async () => finishForMeStep(projectId));
    steps.push(ffm);
  }

  const publish = await runStep("publish", async () => publishStep(projectId, dryRun));
  steps.push(publish);

  const ok = steps.every((s) => s.ok);

  return json(res, ok ? 200 : 500, {
    ok,
    projectId,
    agent: "auto-publish",
    includeFinishForMe,
    dryRun,
    steps,
  });
}
