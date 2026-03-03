/**
 * GET  /api/sites  — list the current user's saved sites
 * DELETE /api/sites?id=xxx — delete a site
 */
import { del } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { SavedSiteMeta } from "./save/route";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db
      .select()
      .from(schema.sites)
      .where(eq(schema.sites.userId, userId))
      .orderBy(desc(schema.sites.createdAt))
      .limit(100);

    const sites: SavedSiteMeta[] = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      prompt: r.prompt,
      title: r.title,
      industry: r.industry,
      vibe: r.vibe,
      blobUrl: r.blobUrl,
      slug: r.slug,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ sites });
  } catch {
    return NextResponse.json({ error: "Failed to load sites" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const rows = await db
      .select()
      .from(schema.sites)
      .where(and(eq(schema.sites.id, id), eq(schema.sites.userId, userId)))
      .limit(1);

    const site = rows[0];
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from Blob storage
    if (site.blobUrl) {
      await del(site.blobUrl).catch(() => {});
    }

    // Delete domain mapping if deployed
    if (site.slug) {
      await db.delete(schema.domains).where(eq(schema.domains.slug, site.slug));
    }

    // Delete the site
    await db.delete(schema.sites).where(eq(schema.sites.id, id));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }
}
