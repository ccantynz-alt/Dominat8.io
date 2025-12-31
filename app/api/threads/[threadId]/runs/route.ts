// app/api/threads/[threadId]/runs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createRun, listRunsForThread, getRun } from "@/app/lib/runs";

const CreateThreadRunSchema = z.object({
  prompt: z.string().min(1),
});

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const ids = await listRunsForThread(params.threadId, 50);
  const runs = await Promise.all(ids.map((id) => getRun(id)));
  return NextResponse.json({ ok: true, runs: runs.filter(Boolean) });
}

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const body = await req.json().catch(() => null);
  const parsed = CreateThreadRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const run = await createRun({
    threadId: params.threadId,
    prompt: parsed.data.prompt,
  });

  return NextResponse.json({ ok: true, run });
}
