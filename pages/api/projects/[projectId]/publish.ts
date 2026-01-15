import type { NextApiRequest, NextApiResponse } from "next";
import { loadSiteSpec } from "@/app/lib/projectSpecStore";
import { publishSiteSpec } from "@/app/lib/publishedSpecStore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const projectId = req.query.projectId as string;
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  const spec = await loadSiteSpec(projectId);
  if (!spec) {
    return res
      .status(400)
      .json({ ok: false, error: "No site spec to publish" });
  }

  await publishSiteSpec(projectId, spec);

  return res.status(200).json({
    ok: true,
    projectId,
    publicUrl: `/p/${projectId}`,
    publishedAtIso: new Date().toISOString(),
  });
}

