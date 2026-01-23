import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

/**
 * Gallery Agent (INDEX VERSION)
 * - NO scan
 * - NO keys
 * - Uses the authoritative index:
 *     marketing:dominat8:galleryIndex:v1
 * - Writes derived gallery view:
 *     marketing:dominat8:gallery:v1
 */

const INDEX_KEY = "marketing:dominat8:galleryIndex:v1";
const GALLERY_KEY = "marketing:dominat8:gallery:v1";
const MARKER = "AGENT_marketing_gallery_index_v1_2026-01-22";

type GalleryItem = {
  projectId: string;
  title: string;
  subtitle?: string;
  href: string;
  updatedAtIso: string;
};

type GalleryDoc = {
  marker: string;
  updatedAtIso: string;
  count: number;
  items: GalleryItem[];
  notes?: string;
};

function safeJsonParse(raw: any) {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = (req.body ?? {}) as any;
    const limit = Number.isFinite(Number(body?.limit)) ? Math.max(1, Math.min(60, Number(body.limit))) : 12;

    const indexRaw = await kv.get(INDEX_KEY);
    const indexDoc = safeJsonParse(indexRaw);

    const indexItems: GalleryItem[] = Array.isArray(indexDoc?.items) ? indexDoc.items : [];

    // Sort newest-first if updatedAtIso exists
    const sorted = [...indexItems].sort((a: any, b: any) => {
      const ta = Date.parse(a?.updatedAtIso || "") || 0;
      const tb = Date.parse(b?.updatedAtIso || "") || 0;
      return tb - ta;
    });

    const items = sorted.slice(0, limit).map((x: any) => ({
      projectId: String(x.projectId || ""),
      title: String(x.title || "Published site"),
      subtitle: x.subtitle ? String(x.subtitle) : undefined,
      href: String(x.href || "#"),
      updatedAtIso: String(x.updatedAtIso || new Date().toISOString()),
    })).filter((x: any) => x.projectId);

    const doc: GalleryDoc = {
      marker: MARKER,
      updatedAtIso: new Date().toISOString(),
      count: items.length,
      items,
      notes: indexItems.length
        ? `Gallery built from index (${INDEX_KEY}).`
        : `Index is empty (${INDEX_KEY}). Use /api/marketing/index-upsert or /api/marketing/index-rebuild.`,
    };

    await kv.set(GALLERY_KEY, JSON.stringify(doc));

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      indexKey: INDEX_KEY,
      galleryKey: GALLERY_KEY,
      updatedAtIso: doc.updatedAtIso,
      count: doc.count,
      notes: doc.notes,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}

