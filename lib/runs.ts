// app/api/runs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun } from "@/lib/runs";

const CreateRunSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string().optional(),
  threadId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const run = await createRun(parsed.data);
  return NextResponse.json({ ok: true, run });
}
