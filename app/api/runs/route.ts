// app/api/runs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun } from "@/lib/runs";

const CreateRunSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
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

  const run = await createRun(parsed.data); // ✅ now matches required prompt type
  return NextResponse.json({ ok: true, run });
}
