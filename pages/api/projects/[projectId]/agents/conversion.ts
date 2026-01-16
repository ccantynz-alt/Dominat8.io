// pages/api/projects/[projectId]/agents/conversion.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { json, methodNotAllowed, runStep } from "./_runtime";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return methodNotAllowed(req, res);

  const projectId = String(req.query.projectId || "");

  const result = await runStep("conversion", async () => {
    // TODO: Replace with real conversion logic later.
    return {
      projectId,
      summary: "Conversion stub OK (routing + runtime verified).",
      ctas: ["Start Free", "Book a Call", "Get a Quote"],
    };
  });

  return json(res, 200, { ok: result.ok, projectId, result });
}
