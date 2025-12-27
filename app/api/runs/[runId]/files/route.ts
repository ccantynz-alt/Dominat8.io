import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

type RunFile = { path: string; content: string };

function runFilesKey(userId: string, runId: string) {
  // ✅ If your existing file route uses a different KV key, update this to match it.
  return `runs:${userId}:${runId}:files`;
}

export async function readRunFiles(userId: string, runId: string): Promise<RunFile[]> {
  const files = await kvJsonGet<RunFile[]>(runFilesKey(userId, runId));
  return Array.isArray(files) ? files : [];
}

const ParamsSchema = z.object({
  runId: z.string().min(1),
});

export async function GET(
  _req: Request,
  ctx: { params: { runId: string } }
) {
  const userId = await getCurrentUserId();
  const { runId } = ParamsSchema.parse(ctx.params);

  const files = await readRunFiles(userId, runId);
  return NextResponse.json({ ok: true, files });
}
