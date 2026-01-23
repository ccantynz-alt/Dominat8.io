import { NextRequest, NextResponse } from "next/server";

const MARKER = "RELEASE2D_middleware_v1_2026-01-23";

export const config = {
  // Don’t interfere with Next internals or API routes
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};

function normalizeHost(raw: string) {
  const s = (raw || "").trim().toLowerCase();
  // Strip port
  return (s.split(":")[0] || "").trim();
}

function isBypassHost(host: string) {
  if (!host) return true;
  // Local dev
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  // Vercel preview/prod domains (keep marketing on /)
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

async function upstashGetString(key: string) {
  const restUrl = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  if (!restUrl || !token) {
    return { ok: false as const, error: "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN" };
  }

  const url = restUrl.replace(/\/+$/, "") + "/get/" + encodeURIComponent(key);

  const resp = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const text = await resp.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {}

  const result = parsed?.result ?? null;

  return { ok: resp.ok, status: resp.status, result };
}

export async function middleware(req: NextRequest) {
  
  // IMPORTANT: never rewrite API or Next internals
  const pathname = (req as any).nextUrl?.pathname || "";
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname.startsWith("/sitemap")) {
    return (await import("next/server")).NextResponse.next();
  }
const host = normalizeHost(req.headers.get("host") || "");

  // Always mark responses so curl -D - can prove middleware is running
  const base = NextResponse.next();
  base.headers.set("x-dominat8-marker", MARKER);
  base.headers.set("x-dominat8-domain", host || "");
  base.headers.set("x-dominat8-path", pathname || "");

  // Don’t route vercel.app or localhost
  if (isBypassHost(host)) return base;

  // Avoid rewriting the already-routed published path
  if (pathname.startsWith("/p/")) return base;

  const key = `domain:route:${host}`;

  let lookup: any;
  try {
    lookup = await upstashGetString(key);
  } catch (e: any) {
    base.headers.set("x-dominat8-kv", "error");
    base.headers.set("x-dominat8-error", e?.message || String(e));
    return base;
  }

  if (!lookup?.ok) {
    base.headers.set("x-dominat8-kv", "unavailable");
    base.headers.set("x-dominat8-error", lookup?.error || "kv lookup failed");
    return base;
  }

  const projectId = typeof lookup.result === "string" ? lookup.result : null;

  if (!projectId) {
    base.headers.set("x-dominat8-kv", "no-mapping");
    return base;
  }

  // Rewrite <domain>/* => /p/<projectId>/*
  const url = req.nextUrl.clone();
  url.pathname = `/p/${projectId}${pathname}`;

  const res = NextResponse.rewrite(url);
  res.headers.set("x-dominat8-marker", MARKER);
  res.headers.set("x-dominat8-domain", host);
  res.headers.set("x-dominat8-project", projectId);
  res.headers.set("x-dominat8-kv", "mapped");
  return res;
}


