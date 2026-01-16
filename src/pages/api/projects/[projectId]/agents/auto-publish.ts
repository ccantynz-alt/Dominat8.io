// pages/api/projects/[projectId]/agents/auto-publish.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed", allow: ["POST"] });
  }

  const projectId = String(req.query.projectId || "");

  return res.status(200).json({
    ok: true,
    projectId,
    agent: "auto-publish",
    message: "Reached Pages API auto-publish (JSON)",
    nowIso: new Date().toISOString(),
  });
}
