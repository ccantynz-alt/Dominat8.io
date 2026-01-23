import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const THEME_KEY = (projectId: string) => `project:${projectId}:theme:v1`;

type Theme = {
  accent: string;
  bg: string;
  text: string;
  font: string;
};

const DEFAULT_THEME: Theme = {
  accent: "#111827",
  bg: "#ffffff",
  text: "#111827",
  font: "Inter",
};

function safeJsonParse<T>(s: any, fallback: T): T {
  try {
    if (typeof s !== "string") s = String(s);
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  const nowIso = new Date().toISOString();

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId", nowIso });

  if (req.method === "GET") {
    try {
      const raw = await kv.get(THEME_KEY(projectId));
      const theme = raw ? safeJsonParse<Theme>(raw, DEFAULT_THEME) : DEFAULT_THEME;
      return res.status(200).json({ ok: true, projectId, theme, nowIso });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? safeJsonParse<any>(req.body, {}) : (req.body || {});
      const theme: Theme = {
        accent: String(body.accent || DEFAULT_THEME.accent),
        bg: String(body.bg || DEFAULT_THEME.bg),
        text: String(body.text || DEFAULT_THEME.text),
        font: String(body.font || DEFAULT_THEME.font),
      };

      await kv.set(THEME_KEY(projectId), JSON.stringify(theme));
      return res.status(200).json({ ok: true, projectId, theme, nowIso });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method Not Allowed", nowIso });
}

