import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

/**
 * DEBUG: KV GET (read-only)
 *
 * GET /api/debug/kv-get?key=...
 * OR  /api/debug/kv-get?key64=...   (base64url, recommended)
 *
 * Returns:
 *  - exists
 *  - type
 *  - length/head for strings
 *  - echoes receivedKeyRaw + decodedKey for debugging
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const keyRaw =
    typeof req.query.key === "string"
      ? req.query.key
      : Array.isArray(req.query.key)
      ? req.query.key[0]
      : "";

  const key64 =
    typeof req.query.key64 === "string"
      ? req.query.key64
      : Array.isArray(req.query.key64)
      ? req.query.key64[0]
      : "";

  const headNRaw =
    typeof req.query.head === "string"
      ? req.query.head
      : Array.isArray(req.query.head)
      ? req.query.head[0]
      : "800";

  const headN = Number(headNRaw);
  const head = Number.isFinite(headN) ? Math.max(0, Math.min(5000, headN)) : 800;

  let mode: "key" | "key64" = "key";
  let key = "";

  try {
    if (key64) {
      mode = "key64";
      // base64url -> base64
      const b64 = key64.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
      const buf = Buffer.from(b64 + pad, "base64");
      key = buf.toString("utf8");
    } else {
      mode = "key";
      // decodeURIComponent will reverse client EscapeDataString
      key = keyRaw ? decodeURIComponent(keyRaw) : "";
    }
  } catch {
    key = "";
  }

  if (!key) {
    return res.status(400).json({
      ok: false,
      error: "Missing ?key= (url-encoded) or ?key64= (base64url)",
      receivedKeyRaw: keyRaw || null,
      receivedKey64: key64 || null,
      decodedKey: null,
      mode,
    });
  }

  try {
    const v: any = await kv.get(key);

    if (v == null) {
      return res.status(200).json({
        ok: true,
        exists: false,
        key,
        mode,
        receivedKeyRaw: keyRaw || null,
        receivedKey64: key64 || null,
        decodedKey: key,
        valueType: null,
      });
    }

    const valueType = typeof v;

    if (valueType === "string") {
      const s = v as string;
      return res.status(200).json({
        ok: true,
        exists: true,
        key,
        mode,
        receivedKeyRaw: keyRaw || null,
        receivedKey64: key64 || null,
        decodedKey: key,
        valueType,
        length: s.length,
        head: s.slice(0, head),
      });
    }

    let json: string | null = null;
    try {
      json = JSON.stringify(v);
    } catch {
      json = null;
    }

    return res.status(200).json({
      ok: true,
      exists: true,
      key,
      mode,
      receivedKeyRaw: keyRaw || null,
      receivedKey64: key64 || null,
      decodedKey: key,
      valueType,
      jsonLength: json ? json.length : null,
      value: v,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      key,
      mode,
      receivedKeyRaw: keyRaw || null,
      receivedKey64: key64 || null,
      decodedKey: key,
      error: String(e?.message || e),
    });
  }
}
