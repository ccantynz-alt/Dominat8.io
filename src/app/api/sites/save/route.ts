import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SavedSiteMeta = {
  id: string;
  prompt: string;
  blobUrl: string;
  createdAt: string;
  userId?: string;
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to save and share sites" }, { status: 401 });
  }

  try {
    const { html, prompt } = await req.json() as { html: string; prompt: string };

    if (!html?.trim()) {
      return NextResponse.json({ error: "html required" }, { status: 400 });
    }

    const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Store HTML in Vercel Blob
    const blob = await put(`sites/${id}.html`, html, {
      access: "public",
      contentType: "text/html; charset=utf-8",
    });

    const meta: SavedSiteMeta = {
      id,
      prompt: prompt?.slice(0, 200) ?? "",
      blobUrl: blob.url,
      createdAt: new Date().toISOString(),
      userId,
    };

    // Store metadata in KV
    await kv.set(`site:${id}`, meta, { ex: 60 * 60 * 24 * 90 }); // 90 days TTL

    // Append to this user's recent deployments (for TV / cockpit)
    try {
      await kv.lpush(`user:${userId}:deployments:recent`, id);
      await kv.ltrim(`user:${userId}:deployments:recent`, 0, 99);
    } catch { /* non-fatal */ }

    return NextResponse.json({
      ok: true,
      id,
      shareUrl: `/s/${id}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If storage is not configured (dev env), return a helpful error
    if (msg.includes("BLOB_READ_WRITE_TOKEN") || msg.includes("KV_")) {
      return NextResponse.json(
        { error: "Share feature requires Vercel deployment", code: "STORAGE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to save site" }, { status: 500 });
  }
}
