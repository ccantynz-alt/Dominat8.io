// src/pages/api/projects/[projectId]/agents/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const projectId = String(req.query.projectId || "");
    if (!projectId) {
      return res.status(400).json({ ok: false, error: "Missing projectId" });
    }

    return res.status(200).json({
      ok: true,
      projectId,
      agents: [
        {
          id: "auto",
          label: "Auto-Publish (1 click)",
          endpoint: `/api/projects/${projectId}/agents/auto-publish`,
          method: "POST",
        },
        {
          id: "finish",
          label: "Finish-for-me",
          endpoint: `/api/projects/${projectId}/agents/finish-for-me`,
          method: "POST",
        },
        {
          id: "seo",
          label: "SEO Agent",
          endpoint: `/api/projects/${projectId}/agents/seo`,
          method: "POST",
        },
        {
          id: "publish",
          label: "Publish",
          endpoint: `/api/projects/${projectId}/publish`,
          method: "POST",
        },
      ],
      publicUrl: `/p/${projectId}`,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Agents index failed" });
  }
}
