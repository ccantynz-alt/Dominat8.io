import type { NextApiRequest, NextApiResponse } from "next";
import { runLaunchRun } from "@/src/server/agents/launchRun";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const job = await runLaunchRun(projectId, req.query);
  return res.status(200).json(job);
}
