// pages/api/projects/[projectId]/agents/finish-for-me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "../../../../../src/lib/kv";

type Step = {
  step: string;
  ok: boolean;
  status: number;
  message?: string;
};

function draftSpecKey(projectId: string) {
  // This is what the existing shim used
  return `project:${projectId}:spec`;
}

function publishedSpecKey(projectId: string) {
  // âœ… Canonical key expected by pages/api/projects/[projectId]/debug/spec.ts allowlist
  return `project:${projectId}:publishedSpec`;
}

function minimalSpec(projectId: string) {
  return {
    ok: true,
    projectId,
    createdAtIso: new Date().toISOString(),
    version: 1,
    brand: { name: "Draft Site" },
    pages: [
      {
        slug: "/",
        title: "Home",
        sections: [{ type: "hero", headline: "Welcome", subheadline: "Draft site" }],
      },
    ],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const steps: Step[] = [];

  try {
    const spec = minimalSpec(projectId);

    // âœ… Always ensure a draft spec exists (legacy key used by older code)
    const draftKey = draftSpecKey(projectId);
    const existingDraft = (await kv.get(draftKey)) as any;
    if (existingDraft) {
      steps.push({ step: "seed-spec", ok: true, status: 200, message: "Spec already exists" });
    } else {
      await kv.set(draftKey, JSON.stringify(spec));
      steps.push({ step: "seed-spec", ok: true, status: 200, message: "Draft spec created in KV" });
    }

    // âœ… Always write canonical publishedSpec key for QA/debug tooling
    const pubKey = publishedSpecKey(projectId);
    await kv.set(pubKey, JSON.stringify(spec));
    steps.push({
      step: "publishedSpec",
      ok: true,
      status: 200,
      message: `Wrote ${pubKey}`,
    });

    steps.push({
      step: "finish-for-me",
      ok: true,
      status: 200,
      message: "Finish-for-me KV shim complete",
    });

    return res.status(200).json({
      ok: true,
      projectId,
      nowIso: new Date().toISOString(),
      steps,
      writtenKeys: [draftKey, pubKey],
    });
  } catch (e: any) {
    steps.push({ step: "finish-for-me", ok: false, status: 500, message: e?.message || "Unknown error" });
    return res.status(500).json({
      ok: false,
      error: "finish-for-me failed",
      projectId,
      nowIso: new Date().toISOString(),
      steps,
    });
  }
}

