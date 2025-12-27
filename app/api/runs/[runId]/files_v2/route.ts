import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

type RunFile = {
  path: string;
  content: string;
};

const ParamsSchema = z.object({
  runId: z.string().min(1),
});

function filesKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}:files`;
}

export async function GET(
  _req: Request,
  ctx: { params: { runId: string } }
) {
  const userId = await getCurrentUserId();
  const { runId } = ParamsSchema.parse(ctx.params);

  const files = await kvJsonGet<RunFile[]>(filesKey(userId, runId));

  return NextResponse.json({
    ok: true,
    files: Array.isArray(files) ? files : [],
  });
}
