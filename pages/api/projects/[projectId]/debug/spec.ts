import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

function isString(x: any): x is string {
  return typeof x === "string";
}

function isPlainObject(x: any): x is Record<string, any> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function projectKeyAllowlist(projectId: string) {
  // Only allow project-scoped keys (no arbitrary KV reads)
  return new Set<string>([
    `generated:project:${projectId}:latest`,
    `published:project:${projectId}:latest`,
    `project:${projectId}:seoPlan`,
    `project:${projectId}:sitemapXml`,
    `project:${projectId}:publishedSpec`,
  ]);
}

function previewValue(value: any) {
  if (value === null || value === undefined) return null;

  if (isString(value)) {
    return {
      kind: "string" as const,
      length: value.length,
      first500: value.slice(0, 500),
    };
  }

  if (Array.isArray(value)) {
    return {
      kind: "array" as const,
      length: value.length,
      first50: value.slice(0, 50),
    };
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    return {
      kind: "object" as const,
      keysCount: keys.length,
      keys: keys.slice(0, 100),
    };
  }

  return {
    kind: typeof value,
    value: String(value).slice(0, 500),
  };
}

/**
 * GET /api/projects/:projectId/debug/spec
 *  - Preview mode (default): returns presentKeys/missingKeys + previews{}
 *
 * GET /api/projects/:projectId/debug/spec?full=1&key=<KV_KEY>
 *  - Full mode: returns FULL value for allowlisted key only
 */
export default async function debugSpec(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const projectIdRaw = req.query.projectId;
  const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;

  if (!projectId) {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  const full = String(req.query.full || "") === "1";
  const key = Array.isArray(req.query.key) ? req.query.key[0] : (req.query.key as string | undefined);

  const allow = projectKeyAllowlist(projectId);

  // FULL MODE
  if (full) {
    if (!key) {
      return res.status(400).json({ ok: false, error: "Missing key for full=1", projectId });
    }
    if (!allow.has(key)) {
      return res.status(403).json({
        ok: false,
        error: "Key not allowlisted for full read",
        projectId,
        key,
        allowlistedKeys: Array.from(allow),
      });
    }

    try {
      const value = await kv.get(key);
      return res.status(200).json({
        ok: true,
        projectId,
        mode: "full",
        key,
        value,
      });
    } catch (e: any) {
      return res.status(500).json({
        ok: false,
        error: "KV read failed (full)",
        projectId,
        key,
        details: String(e?.message || e),
      });
    }
  }

  // PREVIEW MODE
  const keys = Array.from(allow);

  try {
    const values = await kv.mget<any[]>(...keys);

    const presentKeys: string[] = [];
    const missingKeys: string[] = [];
    const previews: Record<string, any> = {};

    keys.forEach((k, idx) => {
      const v = values?.[idx];
      if (v === null || v === undefined) {
        missingKeys.push(k);
      } else {
        presentKeys.push(k);
        previews[k] = previewValue(v);
      }
    });

    return res.status(200).json({
      ok: true,
      projectId,
      mode: "preview",
      presentKeys,
      missingKeys,
      previews,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "KV read failed (preview)",
      projectId,
      details: String(e?.message || e),
    });
  }
}
