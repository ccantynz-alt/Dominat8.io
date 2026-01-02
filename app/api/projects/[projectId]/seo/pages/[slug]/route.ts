import { NextResponse } from "next/server";
import { deleteSeoPage } from "../../../../../../lib/seoPagesKV";
import { rateLimitOrThrow } from "../../../../../../lib/rateLimitKV";
import { getCurrentUserId } from "../../../../../../lib/demoAuth";

export async function DELETE(
  _: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const userId = getCurrentUserId();
  await rateLimitOrThrow({
    key: `rl:seo:delete:${userId}:${params.projectId}`,
    limit: 30,
    windowSec: 60,
    message: "Too many deletes. Slow down.",
  });

  const result = await deleteSeoPage(params.projectId, params.slug);
  return NextResponse.json({ ok: true, ...result });
}
