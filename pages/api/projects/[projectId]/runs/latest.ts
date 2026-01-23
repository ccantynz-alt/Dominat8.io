import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

function runKey(projectId: string) {
  return `run:project:${projectId}:latest`;
}

export default async function latestRun(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const projectIdRaw = req.query.projectId;
  const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;

  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  try {
    const value = await kv.get(runKey(projectId));
    if (!value) {
      return res.status(200).json({
        ok: true,
        projectId,
        status: "none",
        message: "No run state found yet for this project.",
      });
    }

    // ✅ return state (not value) so UI has a stable shape
    return res.status(200).json({ ok: true, projectId, state: value });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      projectId,
      error: "KV read failed",
      details: String(e?.message || e),
    });
  }
}

