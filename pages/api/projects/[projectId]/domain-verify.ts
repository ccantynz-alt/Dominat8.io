// pages/api/projects/[projectId]/domain-verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const KEY_DOMAIN = (projectId: string) => `project:${projectId}:domain:requested:v1`;
const KEY_STATUS = (projectId: string) => `project:${projectId}:domain:status:v1`;

function apiBase() {
  return "https://api.vercel.com";
}

function qTeam() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

function projectIdOrName() {
  return process.env.VERCEL_PROJECT_ID_OR_NAME || "my-saas-app-5eyw";
}

function token() {
  return process.env.VERCEL_API_TOKEN || "";
}

async function vercelFetch(path: string, init?: RequestInit) {
  const t = token();
  if (!t) throw new Error("Missing VERCEL_API_TOKEN (set it in Vercel env)");
  const r = await fetch(apiBase() + path + qTeam(), {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: r.ok, status: r.status, json, text };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  const nowIso = new Date().toISOString();

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId", nowIso });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed", nowIso });
  }

  try {
    const domainRaw = await kv.get(KEY_DOMAIN(projectId));
    const domain = domainRaw ? String(domainRaw).trim().toLowerCase() : "";
    if (!domain) return res.status(400).json({ ok: false, error: "No domain saved for this project", nowIso });

    const proj = projectIdOrName();
    const path = `/v9/projects/${encodeURIComponent(proj)}/domains/${encodeURIComponent(domain)}/verify`;
    const v = await vercelFetch(path, { method: "POST" });

    // Update status KV to pending; domain-status will finalize verified/pending on next check
    await kv.set(KEY_STATUS(projectId), JSON.stringify({ status: "pending", lastCheckedIso: nowIso, details: { action: "verify", vercelStatus: v.status } }));

    return res.status(200).json({
      ok: true,
      projectId,
      domain,
      vercelOk: v.ok,
      vercelStatus: v.status,
      vercel: v.json || v.text,
      nowIso,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
  }
}

