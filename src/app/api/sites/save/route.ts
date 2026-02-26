import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export type SavedSiteMeta = {
  id: string;
  userId: string | null;
  prompt: string;
  title: string;
  industry: string;
  vibe: string;
  blobUrl: string;
  slug: string | null;  // e.g. "acme-plumbing" → slug.dominat8.io
  createdAt: string;
};

export async function POST(req: NextRequest) {
  try {
    const { html, prompt, title, industry, vibe } = await req.json() as {
      html: string;
      prompt: string;
      title?: string;
      industry?: string;
      vibe?: string;
    };

    if (!html?.trim()) {
      return NextResponse.json({ error: "html required" }, { status: 400 });
    }

    const { userId } = await auth();
    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Store HTML in Vercel Blob
    const blob = await put(`sites/${id}.html`, html, {
      access: "public",
      contentType: "text/html; charset=utf-8",
    });

    // Derive a clean title from the prompt if not provided
    const cleanTitle = title?.trim()
      || prompt?.slice(0, 60).replace(/^a\s+/i, "").replace(/^an?\s+/i, "").trim()
      || "Untitled Site";

    const meta: SavedSiteMeta = {
      id,
      userId: userId ?? null,
      prompt: prompt?.slice(0, 300) ?? "",
      title: cleanTitle,
      industry: industry ?? "",
      vibe: vibe ?? "",
      blobUrl: blob.url,
      slug: null,
      createdAt: new Date().toISOString(),
    };

    // Store site metadata — 90 days TTL for anon, never expire for logged-in
    const ttl = userId ? undefined : 60 * 60 * 24 * 90;
    if (ttl) {
      await kv.set(`site:${id}`, meta, { ex: ttl });
    } else {
      await kv.set(`site:${id}`, meta);
    }

    // If logged in, add to user's site list (prepend so newest first)
    if (userId) {
      await kv.lpush(`user:${userId}:sites`, id);
      // Keep max 100 sites per user
      await kv.ltrim(`user:${userId}:sites`, 0, 99);
    }

    return NextResponse.json({
      ok: true,
      id,
      shareUrl: `/s/${id}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("BLOB_READ_WRITE_TOKEN") || msg.includes("KV_")) {
      return NextResponse.json(
        { error: "Share feature requires Vercel deployment", code: "STORAGE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to save site" }, { status: 500 });
  }
}
