import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SavedSiteMeta = {
  id: string;
  prompt: string;
  blobUrl: string;
  createdAt: string;
};

export async function POST(req: NextRequest) {
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
    };

    // Store metadata in KV
    await kv.set(`site:${id}`, meta, { ex: 60 * 60 * 24 * 90 }); // 90 days TTL

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
