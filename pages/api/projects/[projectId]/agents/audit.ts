// pages/api/projects/[projectId]/agents/audit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { json, methodNotAllowed, runStep } from "./_runtime";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return methodNotAllowed(req, res);

  const projectId = String(req.query.projectId || "");

  const result = await runStep("audit", async () => {
    // TODO: Replace with real audit logic later.
    return {
      projectId,
      summary: "Audit stub OK (routing + runtime verified).",
      issues: [],
      recommendations: [],
    };
  });

  return json(res, 200, { ok: result.ok, projectId, result });
}
