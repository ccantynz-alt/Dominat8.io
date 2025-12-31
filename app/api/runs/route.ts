import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun } from "@/lib/runs";

const CreateRunSchema = z.object({
  prompt: z.string().optional(),
  agent: z.enum(["general", "planner", "coder", "reviewer", "researcher"]).optional(),
  threadId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { prompt, agent, threadId, projectId } = parsed.data;

  // ✅ runtime check + TypeScript narrowing (fixes the build)
  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "prompt is required" },
      { status: 400 }
    );
  }

  const run = await createRun({ prompt, agent, threadId, projectId });
  return NextResponse.json({ ok: true, run });
}
