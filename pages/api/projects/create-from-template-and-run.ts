// pages/api/projects/create-from-template-and-run.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { templatesCatalog, type TemplateId } from "@/src/lib/templatesCatalog";
import { kv } from '@/src/lib/kv';
import { runLaunchRun } from "@/src/server/agents/launchRun";

type Ok = {
  ok: true;
  projectId: string;
  templateId: TemplateId;
  runId?: string;
  redirectUrl: string;
  writtenKeys: string[];
  nowIso: string;
};

type Err = {
  ok: false;
  error: string;
  nowIso: string;
};

function makeProjectId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `proj_${Date.now()}_${rand}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  const nowIso = new Date().toISOString();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed", nowIso });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const templateId = body?.templateId as TemplateId | undefined;

    if (!templateId) return res.status(400).json({ ok: false, error: "Missing templateId", nowIso });

    const template = templatesCatalog.find((t) => t.id === templateId);
    if (!template) return res.status(404).json({ ok: false, error: `Unknown templateId: ${templateId}`, nowIso });

    const projectId = makeProjectId();

    // Keys (string values)
    const metaKey = `project:${projectId}:meta`;
    const templateKey = `project:${projectId}:templateId`;
    const specKey = `generated:project:${projectId}:latest`;

    const metaValue = JSON.stringify({
      projectId,
      createdAtIso: nowIso,
      name: ((template as any)?.seed?.title ?? (template as any)?.title ?? "Untitled Template"),
            description: ((template as any)?.seed?.description ?? (template as any)?.description ?? ""),
    });

    const seedSpecValue = JSON.stringify({
      ok: true,
      source: "template-seed",
      version: "TEMPLATE_seed_v1_2026-01-21",
      projectId,
      templateId: template.id,
      createdAtIso: nowIso,
      spec: ((template as any)?.seed ?? (template as any)?.spec ?? (template as any)),
    });

    const writtenKeys: string[] = [];
    await kv.set(metaKey, metaValue); writtenKeys.push(metaKey);
    await kv.set(templateKey, String(template.id)); writtenKeys.push(templateKey);
    await kv.set(specKey, seedSpecValue); writtenKeys.push(specKey);

    // Immediately run full pipeline (same as clicking One Button Publish)
    const job: any = await runLaunchRun(projectId, req.query);

    const runId = job?.runId as string | undefined;

    const redirectUrl = runId
      ? `/projects/${projectId}/publish?runId=${encodeURIComponent(runId)}`
      : `/projects/${projectId}/publish`;

    return res.status(200).json({
      ok: true,
      projectId,
      templateId: template.id,
      runId,
      redirectUrl,
      writtenKeys,
      nowIso,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Internal Server Error", nowIso });
  }
}


