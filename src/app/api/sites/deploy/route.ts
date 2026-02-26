/**
 * POST /api/sites/deploy
 * Claims a slug and deploys a saved site to {slug}.dominat8.io
 *
 * Body: { siteId: string, slug: string }
 * Returns: { ok: true, url: "https://{slug}.dominat8.io" }
 */
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { SavedSiteMeta } from "../save/route";

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
  const plan = (await kv.get<string>(`user:${userId}:plan`)) ?? "free";
  const isAdmin = (process.env.ADMIN_USER_IDS ?? "").split(",").includes(userId);
  if (!DEPLOY_PLANS.has(plan) && !isAdmin) {
    return NextResponse.json({
      error: "Subdomain deployment requires Pro plan",
      code: "UPGRADE_REQUIRED",
    }, { status: 403 });
  }

  // Verify site ownership
  const meta = await kv.get<SavedSiteMeta>(`site:${siteId}`);
  if (!meta || meta.userId !== userId) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Check slug availability
  const existing = await kv.get<string>(`domain:${cleanSlug}`);
  if (existing && existing !== siteId) {
    return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });
  }

  // Release old slug if user had one for this site
  if (meta.slug && meta.slug !== cleanSlug) {
    await kv.del(`domain:${meta.slug}`);
  }

  // Claim the new slug
  await kv.set(`domain:${cleanSlug}`, siteId);

  // Update site metadata with slug
  await kv.set(`site:${siteId}`, { ...meta, slug: cleanSlug });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dominat8.io";
  const host = new URL(appUrl).hostname;
  const deployUrl = `https://${cleanSlug}.${host}`;

  return NextResponse.json({ ok: true, url: deployUrl, slug: cleanSlug });
}
