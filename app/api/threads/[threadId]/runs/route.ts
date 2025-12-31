import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun, listThreadRuns } from "@/lib/runs";

const CreateThreadRunSchema = z.object({
  prompt: z.string().optional(),
  agent: z.enum(["general", "planner", "coder", "reviewer", "researcher"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;
  const runs = await listThreadRuns(threadId);
  return NextResponse.json({ ok: true, runs });
}

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const threadId = params.threadId;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateThreadRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { prompt, agent } = parsed.data;

  // ✅ runtime check + TS narrowing
  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "prompt is required" },
      { status: 400 }
    );
  }

  const run = await createRun({ threadId, prompt, agent });
  return NextResponse.json({ ok: true, run });
}
