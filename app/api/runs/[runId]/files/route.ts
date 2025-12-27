import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "../../../../lib/demoAuth";
import { kvJsonGet } from "../../../../lib/kv";

type RunFile = { path: string; content: string };

const ParamsSchema = z.object({
  runId: z.string().min(1),
});

function runFilesKey(userId: string, runId: string) {
  // If your app uses a different key, we can change this later.
  return `runs:${userId}:${runId}:files`;
}

export async function GET(_req: Request, ctx: { params: { runId: string } }) {
  const userId = await getCurrentUserId();
  const { runId } = ParamsSchema.parse(ctx.params);

  const files = (await kvJsonGet<RunFile[]>(runFilesKey(userId, runId))) ?? [];
  return NextResponse.json({ ok: true, files: Array.isArray(files) ? files : [] });
}
