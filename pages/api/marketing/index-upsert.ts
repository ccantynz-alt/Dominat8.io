import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const MARKER = "AGENT_marketing_index_upsert_v2_2026-01-22";

// Keep these aligned with your gallery generator
const INDEX_KEY = "marketing:dominat8:galleryIndex:v1";

function nowIso() {
  return new Date().toISOString();
}

function safeString(v: any): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try {
    return String(v);
  } catch {
    return "";
  }
}

function shortProjectId(projectId: string) {
  return projectId.slice(0, 8);
}

function pickTitleFromPublishedSpec(spec: any, projectId: string) {
  // Best: brand.name
  const brandName = spec?.brand?.name;
  if (typeof brandName === "string" && brandName.trim()) return brandName.trim();

  // Next: first page title
  const p0Title = spec?.pages?.[0]?.title;
  if (typeof p0Title === "string" && p0Title.trim()) return p0Title.trim();

  // Next: hero headline
  const heroHeadline = spec?.pages?.[0]?.sections?.find?.((s: any) => s?.type === "hero")?.headline;
  if (typeof heroHeadline === "string" && heroHeadline.trim()) return heroHeadline.trim();

  // Fallback
  return `Published site ${shortProjectId(projectId)}`;
}

function pickSubtitleFromPublishedSpec(spec: any) {
  const sub = spec?.pages?.[0]?.sections?.find?.((s: any) => s?.type === "hero")?.subheadline;
  if (typeof sub === "string" && sub.trim()) return sub.trim();
  return "";
}

type IndexItem = {
  projectId: string;
  title: string;
  subtitle?: string;
  href: string;
  updatedAtIso: string;
};

type IndexDoc = {
  marker: string;
  updatedAtIso: string;
  count: number;
  items: IndexItem[];
};

async function readPublishedSpec(projectId: string): Promise<any | null> {
  const key = `project:${projectId}:publishedSpec`;
  const v: any = await kv.get(key);

  if (v == null) return null;

  // Some KV wrappers store JSON as string; support both.
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      // not JSON, return raw string
      return { raw: s };
    }
  }

  return v;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  let body: any = req.body;
  // If body is a string for any reason, try parse
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const projectId = safeString(body?.projectId).trim();
  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  const href = `/p/${projectId}`;
  const updatedAtIso = nowIso();

  // Read published spec (the real source of title)
  let publishedSpec: any = null;
  try {
    publishedSpec = await readPublishedSpec(projectId);
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "Failed to read publishedSpec from KV",
      projectId,
      details: String(e?.message || e),
    });
  }

  const title = pickTitleFromPublishedSpec(publishedSpec, projectId);
  const subtitle = pickSubtitleFromPublishedSpec(publishedSpec);

  const item: IndexItem = {
    projectId,
    title,
    href,
    updatedAtIso,
  };
  if (subtitle) item.subtitle = subtitle;

  // Upsert into index
  let doc: IndexDoc | null = null;
  try {
    const existing: any = await kv.get(INDEX_KEY);

    if (existing && typeof existing === "object") {
      doc = existing as IndexDoc;
    } else if (typeof existing === "string" && existing.trim()) {
      try {
        doc = JSON.parse(existing) as IndexDoc;
      } catch {
        doc = null;
      }
    }

    if (!doc || !Array.isArray(doc.items)) {
      doc = {
        marker: MARKER,
        updatedAtIso,
        count: 0,
        items: [],
      };
    }

    const items = doc.items.filter((x) => x && x.projectId !== projectId);
    items.unshift(item);

    // Keep it tidy: cap index size
    const capped = items.slice(0, 200);

    const next: IndexDoc = {
      marker: MARKER,
      updatedAtIso,
      count: capped.length,
      items: capped,
    };

    await kv.set(INDEX_KEY, next);

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      indexKey: INDEX_KEY,
      projectId,
      title,
      subtitle: subtitle || null,
      href,
      updatedAtIso,
      wroteCount: next.count,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "KV index upsert failed",
      projectId,
      indexKey: INDEX_KEY,
      details: String(e?.message || e),
    });
  }
}
