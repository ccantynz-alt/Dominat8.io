/**
 * GET  /api/sites  — list the current user's saved sites
 * DELETE /api/sites?id=xxx — delete a site
 */
import { kv } from "@vercel/kv";
import { del } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { SavedSiteMeta } from "./save/route";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get site IDs for this user
    const ids = await kv.lrange<string>(`user:${userId}:sites`, 0, 99);
    if (!ids || ids.length === 0) return NextResponse.json({ sites: [] });

    // Fetch metadata for each site in parallel
    const metas = await Promise.all(
      ids.map(id => kv.get<SavedSiteMeta>(`site:${id}`))
    );

    // Filter nulls (expired sites) and clean up stale IDs
    const sites = metas
      .map((meta, i) => meta ? meta : { id: ids[i], _expired: true })
      .filter((s): s is SavedSiteMeta => !("_expired" in s));

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
    const meta = await kv.get<SavedSiteMeta>(`site:${id}`);

    // Only owner can delete
    if (!meta || meta.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from Blob storage
    if (meta.blobUrl) {
      await del(meta.blobUrl).catch(() => {});
    }

    // Delete site metadata
    await kv.del(`site:${id}`);

    // Remove from user's site list
    await kv.lrem(`user:${userId}:sites`, 0, id);

    // Clean up subdomain if deployed
    if (meta.slug) {
      await kv.del(`domain:${meta.slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }
}
