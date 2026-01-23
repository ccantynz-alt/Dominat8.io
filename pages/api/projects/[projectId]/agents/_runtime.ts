// pages/api/projects/[projectId]/agents/_runtime.ts
import type { NextApiRequest, NextApiResponse } from "next";

export type AgentStepResult = {
  ok: boolean;
  step: string;
  startedAtIso: string;
  finishedAtIso: string;
  ms: number;
  details?: any;
  error?: string;
};

export function json(res: NextApiResponse, status: number, data: any) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export function methodNotAllowed(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Allow", "POST");
  return json(res, 405, { ok: false, error: "Method Not Allowed", allow: ["POST"] });
}

export async function runStep(
  step: string,
  fn: () => Promise<any>
): Promise<AgentStepResult> {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();

  try {
    const details = await fn();
    const finishedAt = Date.now();
    return {
      ok: true,
      step,
      startedAtIso,
      finishedAtIso: new Date(finishedAt).toISOString(),
      ms: finishedAt - startedAt,
      details,
    };
  } catch (e: any) {
    const finishedAt = Date.now();
    return {
      ok: false,
      step,
      startedAtIso,
      finishedAtIso: new Date(finishedAt).toISOString(),
      ms: finishedAt - startedAt,
      error: e?.message || "Unknown error",
    };
  }
}
