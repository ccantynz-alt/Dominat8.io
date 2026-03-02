/**
 * POST /api/sites/deploy
 * Claims a slug and deploys a saved site to {slug}.dominat8.io
 *
 * Body: { siteId: string, slug: string }
 * Returns: { ok: true, url: "https://{slug}.dominat8.io" }
 */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

// Plans that can deploy to subdomains
const DEPLOY_PLANS = new Set(["pro", "agency", "admin"]);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId, slug } = await req.json() as { siteId: string; slug: string };

  if (!siteId || !slug) {
    return NextResponse.json({ error: "siteId and slug required" }, { status: 400 });
  }

  const cleanSlug = slug.toLowerCase().trim();
  if (!SLUG_RE.test(cleanSlug)) {
    return NextResponse.json({
      error: "Slug must be 3-40 lowercase letters, numbers, and hyphens"
    }, { status: 400 });
  }

  // Blocked slugs
  const BLOCKED = new Set(["www", "app", "api", "admin", "mail", "ftp", "dominat8", "build", "dashboard"]);
  if (BLOCKED.has(cleanSlug)) {
    return NextResponse.json({ error: "That slug is reserved" }, { status: 400 });
  }

  // Check plan — only Pro+ can deploy
  const userRows = await db.select({ plan: schema.users.plan }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  const plan = userRows[0]?.plan ?? "free";
  const isAdmin = (process.env.ADMIN_USER_IDS ?? "").split(",").includes(userId);
  if (!DEPLOY_PLANS.has(plan) && !isAdmin) {
    return NextResponse.json({
      error: "Subdomain deployment requires Pro plan",
      code: "UPGRADE_REQUIRED",
    }, { status: 403 });
  }

  // Verify site ownership
  const siteRows = await db
    .select()
    .from(schema.sites)
    .where(and(eq(schema.sites.id, siteId), eq(schema.sites.userId, userId)))
    .limit(1);
  const site = siteRows[0];
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Check slug availability
  const existingDomain = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.slug, cleanSlug))
    .limit(1);
  if (existingDomain[0] && existingDomain[0].siteId !== siteId) {
    return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });
  }

  // Release old slug if user had one for this site
  if (site.slug && site.slug !== cleanSlug) {
    await db.delete(schema.domains).where(eq(schema.domains.slug, site.slug));
  }

  // Claim the new slug (upsert)
  await db
    .insert(schema.domains)
    .values({ slug: cleanSlug, siteId })
    .onConflictDoUpdate({ target: schema.domains.slug, set: { siteId } });

  // Update site metadata with slug
  await db
    .update(schema.sites)
    .set({ slug: cleanSlug })
    .where(eq(schema.sites.id, siteId));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dominat8.io";
  const host = new URL(appUrl).hostname;
  const deployUrl = `https://${cleanSlug}.${host}`;

  return NextResponse.json({ ok: true, url: deployUrl, slug: cleanSlug });
}
