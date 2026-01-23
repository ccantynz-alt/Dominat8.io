// pages/api/projects/[projectId]/domain-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from '@/src/lib/kv';

const KEY_DOMAIN = (projectId: string) => `project:${projectId}:domain:requested:v1`;
const KEY_STATUS = (projectId: string) => `project:${projectId}:domain:status:v1`;

type DomainStatus = {
  status: "none" | "pending" | "verified" | "error";
  lastCheckedIso: string | null;
  details?: any;
};

function safeJsonParse<T>(s: any, fallback: T): T {
  try {
    if (typeof s !== "string") s = String(s);
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

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

async function getProjectDomain(domain: string) {
  const proj = projectIdOrName();
  // Docs show "Get a project domain" and verification challenges are returned from here
  const path = `/v9/projects/${encodeURIComponent(proj)}/domains/${encodeURIComponent(domain)}`;
  return vercelFetch(path, { method: "GET" });
}

async function addDomainToProject(domain: string) {
  const proj = projectIdOrName();
  // Docs: Add a domain to a project
  const path = `/v10/projects/${encodeURIComponent(proj)}/domains`;
  return vercelFetch(path, { method: "POST", body: JSON.stringify({ name: domain }) });
}

function mapStatus(v: any): DomainStatus {
  const nowIso = new Date().toISOString();

  if (!v || typeof v !== "object") {
    return { status: "error", lastCheckedIso: nowIso, details: { reason: "No vercel response" } };
  }

  // Vercel project-domain objects typically include "verified" boolean and "verification" challenges
  const verified = Boolean((v as any).verified);

  return {
    status: verified ? "verified" : "pending",
    lastCheckedIso: nowIso,
    details: v,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const projectId = Array.isArray(req.query.projectId)
    ? req.query.projectId[0]
    : (req.query.projectId as string);

  const nowIso = new Date().toISOString();

  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId", nowIso });

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed", nowIso });
  }

  try {
    const domainRaw = await kv.get(KEY_DOMAIN(projectId));
    const domain = domainRaw ? String(domainRaw).trim().toLowerCase() : "";

    if (!domain) {
      const status: DomainStatus = { status: "none", lastCheckedIso: null };
      await kv.set(KEY_STATUS(projectId), JSON.stringify(status));
      return res.status(200).json({ ok: true, projectId, domain: "", status, nowIso });
    }

    // 1) Try GET project domain
    let gd = await getProjectDomain(domain);

    // 2) If missing, add it then re-fetch
    if (!gd.ok && gd.status === 404) {
      const add = await addDomainToProject(domain);
      if (!add.ok) {
        const status: DomainStatus = {
          status: "error",
          lastCheckedIso: nowIso,
          details: { when: "addDomainToProject", vercelStatus: add.status, vercelBody: add.json || add.text },
        };
        await kv.set(KEY_STATUS(projectId), JSON.stringify(status));
        return res.status(200).json({ ok: true, projectId, domain, status, nowIso });
      }

      gd = await getProjectDomain(domain);
    }

    if (!gd.ok) {
      const status: DomainStatus = {
        status: "error",
        lastCheckedIso: nowIso,
        details: { when: "getProjectDomain", vercelStatus: gd.status, vercelBody: gd.json || gd.text },
      };
      await kv.set(KEY_STATUS(projectId), JSON.stringify(status));
      return res.status(200).json({ ok: true, projectId, domain, status, nowIso });
    }

    const status = mapStatus(gd.json);
    await kv.set(KEY_STATUS(projectId), JSON.stringify(status));

    return res.status(200).json({
      ok: true,
      projectId,
      domain,
      status,
      vercel: gd.json,
      nowIso,
    });
  } catch (e: any) {
    const status: DomainStatus = { status: "error", lastCheckedIso: nowIso, details: { error: e?.message || "Internal Error" } };
    try { await kv.set(KEY_STATUS(projectId), JSON.stringify(status)); } catch {}
    return res.status(500).json({ ok: false, error: e?.message || "Internal Error", nowIso });
  }
}

