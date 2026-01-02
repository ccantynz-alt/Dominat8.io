import { NextResponse } from "next/server";
import { z } from "zod";
import { getSeoPageBySlug, upsertSeoPages } from "../../../../../../../lib/seoPagesKV";
import { generateOneSeoPage } from "../../../../../../../lib/seoAiOnePage";
import { rateLimitOrThrow } from "../../../../../../../lib/rateLimitKV";
import { getCurrentUserId } from "../../../../../../../lib/demoAuth";

const BodySchema = z.object({
  intent: z.string().min(2).max(80).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const userId = getCurrentUserId();

  await rateLimitOrThrow({
    key: `rl:seo:regen:${userId}:${params.projectId}`,
    limit: 10,
    windowSec: 60,
    message: "Too many regenerations. Try again in a minute.",
  });

  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const existing = await getSeoPageBySlug(params.projectId, params.slug);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
  }

  const intent = parsed.data.intent || "improve";

  const regenerated = await generateOneSeoPage({
    keyword: existing.keyword,
    intent,
    forceSlug: existing.slug,
  });

  const merged = await upsertSeoPages(params.projectId, [regenerated]);

  return NextResponse.json({
    ok: true,
    slug: regenerated.slug,
    total: merged.length,
  });
}
