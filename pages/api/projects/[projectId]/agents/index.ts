// pages/api/projects/[projectId]/agents/index.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = String(req.query.projectId || "");
  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  return res.status(200).json({
    ok: true,
    projectId,
    agents: [
      { id: "auto", label: "Auto-Publish (1 click)", endpoint: `/api/projects/${projectId}/agents/auto-publish`, method: "POST" },

      { id: "seed", label: "Seed Draft", endpoint: `/api/projects/${projectId}/seed-spec`, method: "POST" },
      { id: "finish", label: "Finish-for-me", endpoint: `/api/projects/${projectId}/agents/finish-for-me`, method: "POST" },
      { id: "seo", label: "SEO Agent", endpoint: `/api/projects/${projectId}/agents/seo`, method: "POST" },
      { id: "publish", label: "Publish", endpoint: `/api/projects/${projectId}/publish`, method: "POST" },
    ],
    publicUrl: `/p/${projectId}`,
  });
}
