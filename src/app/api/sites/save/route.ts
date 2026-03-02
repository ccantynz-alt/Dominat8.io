import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export type SavedSiteMeta = {
  id: string;
  userId: string | null;
  prompt: string;
  title: string;
  industry: string;
  vibe: string;
  blobUrl: string;
  slug: string | null;
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

    // Insert site into Postgres
    await db.insert(schema.sites).values({
      id,
      userId: userId ?? null,
      prompt: prompt?.slice(0, 300) ?? "",
      title: cleanTitle,
      industry: industry ?? "",
      vibe: vibe ?? "",
      blobUrl: blob.url,
      slug: null,
    });

    return NextResponse.json({
      ok: true,
      id,
      shareUrl: `/s/${id}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("BLOB_READ_WRITE_TOKEN") || msg.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "Share feature requires Vercel deployment", code: "STORAGE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to save site" }, { status: 500 });
  }
}
