// app/api/runs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun } from "@/lib/runs";

const CreateRunSchema = z.object({
  prompt: z.string().optional(), // runtime can accept missing, we hard-enforce below
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

  const { prompt, threadId, projectId } = parsed.data;

  // ✅ hard requirement + narrows TypeScript type to string
  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "prompt is required" },
      { status: 400 }
    );
  }

  const run = await createRun({ prompt, threadId, projectId });
  return NextResponse.json({ ok: true, run });
}
