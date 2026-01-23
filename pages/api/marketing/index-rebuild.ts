import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const INDEX_KEY = "marketing:dominat8:galleryIndex:v1";
const MARKER = "IDX_rebuild_v1_2026-01-22";

const PUBLISHED_PREFIX = "published:project:";
const PUBLISHED_SUFFIX = ":latest";

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

function projectIdFromKey(key: string) {
  if (!key.startsWith(PUBLISHED_PREFIX)) return null;
  if (!key.endsWith(PUBLISHED_SUFFIX)) return null;
  const inner = key.slice(PUBLISHED_PREFIX.length, key.length - PUBLISHED_SUFFIX.length);
  return inner || null;
}

function pickTitleFromSpec(spec: any, projectId: string) {
  const candidates = [
    spec?.title,
    spec?.site?.title,
    spec?.meta?.title,
    spec?.brand?.name,
    spec?.businessName,
    spec?.companyName,
  ].filter((x: any) => typeof x === "string" && x.trim());

  return (candidates[0] as string) || `Published site ${projectId.slice(0, 8)}`;
}

function pickSubtitleFromSpec(spec: any) {
  const candidates = [
    spec?.tagline,
    spec?.site?.tagline,
    spec?.meta?.description,
    spec?.description,
  ].filter((x: any) => typeof x === "string" && x.trim());

  return (candidates[0] as string) || "";
}

async function discoverPublishedKeys(limit: number): Promise<{ keys: string[]; notes: string }> {
  const anyKv: any = kv as any;

  if (typeof anyKv.scan === "function") {
    let cursor: any = 0;
    const found: string[] = [];
    let loops = 0;

    while (loops < 50 && found.length < limit) {
      loops += 1;

      let out: any = null;
      try {
        out = await anyKv.scan(cursor, { match: `${PUBLISHED_PREFIX}*${PUBLISHED_SUFFIX}`, count: 200 });
      } catch {
        try {
          out = await anyKv.scan(cursor, "MATCH", `${PUBLISHED_PREFIX}*${PUBLISHED_SUFFIX}`, "COUNT", 200);
        } catch {
          out = null;
        }
      }

      if (!out) break;

      let nextCursor: any = null;
      let keys: any = null;

      if (Array.isArray(out) && out.length >= 2) {
        nextCursor = out[0];
        keys = out[1];
      } else if (typeof out === "object") {
        nextCursor = out.cursor ?? out[0] ?? null;
        keys = out.keys ?? out[1] ?? null;
      }

      if (Array.isArray(keys)) {
        for (const k of keys) {
          if (typeof k === "string") found.push(k);
          if (found.length >= limit) break;
        }
      }

      cursor = nextCursor;
      if (cursor === 0 || cursor === "0" || cursor == null) break;
    }

    return { keys: found.slice(0, limit), notes: "Rebuild used kv.scan()." };
  }

  if (typeof anyKv.keys === "function") {
    try {
      const keys = await anyKv.keys(`${PUBLISHED_PREFIX}*${PUBLISHED_SUFFIX}`);
      if (Array.isArray(keys)) {
        return {
          keys: keys.filter((k: any) => typeof k === "string").slice(0, limit),
          notes: "Rebuild used kv.keys().",
        };
      }
    } catch {
      // ignore
    }
  }

  return { keys: [], notes: "No kv.scan/kv.keys available; rebuild produced empty index (safe)." };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = (req.body ?? {}) as any;
    const limit = Number.isFinite(Number(body?.limit)) ? Math.max(1, Math.min(200, Number(body.limit))) : 60;

    const discovered = await discoverPublishedKeys(limit);

    const nowIso = new Date().toISOString();
    const items: IndexItem[] = [];

    for (const key of discovered.keys) {
      const projectId = projectIdFromKey(key);
      if (!projectId) continue;

      const raw = await kv.get(key);
      const spec = safeJsonParse(raw);

      const title = pickTitleFromSpec(spec, projectId);
      const subtitle = pickSubtitleFromSpec(spec);

      items.push({
        projectId,
        title,
        subtitle: subtitle || undefined,
        href: `/p/${projectId}`,
        updatedAtIso: nowIso,
      });
    }

    const doc: IndexDoc = {
      marker: MARKER,
      updatedAtIso: nowIso,
      count: items.length,
      items,
      notes: discovered.notes,
    };

    await kv.set(INDEX_KEY, JSON.stringify(doc));

    return res.status(200).json({
      ok: true,
      marker: MARKER,
      indexKey: INDEX_KEY,
      updatedAtIso: doc.updatedAtIso,
      count: doc.count,
      notes: doc.notes,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
}

