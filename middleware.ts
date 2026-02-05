import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * D8_IO_MIDDLEWARE_SINGLE_SOURCE_V1_20260205
 *
 * Rules:
 * - dominat8.io + www.dominat8.io => TV lock (rewrite everything to /io), except allowlist + protected paths
 * - staging.dominat8.io => bypass TV lock
 *   - and force "/" -> "/live" so you SEE A WEBSITE immediately
 */

const PROD_HOSTS = new Set(["dominat8.io", "www.dominat8.io"]);
const STAGING_HOST = "staging.dominat8.io";

// Keep these reachable everywhere (proof endpoints, health, static)
const ALLOW_PREFIXES: string[] = [
  "/api/__d8__/stamp",
  "/api/__d8__/where",
  "/api/__d8__/proof",
  "/stamp",
  "/healthz",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/live" // our heartbeat page
];

// Do NOT rewrite these; let app handle auth/logic
const PROTECTED_PREFIXES: string[] = [
  "/admin",
  "/cockpit",
  "/agents",
  "/api/agents",
  "/api/engine",
  "/api/admin",
  "/api/cockpit",
  "/tv",
  "/api/tv"
];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  for (const p of prefixes) {
    if (pathname === p) return true;
    if (pathname.startsWith(p + "/")) return true;
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

function getHost(req: NextRequest): string {
  const h =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "";
  return h.toString().trim().toLowerCase();
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = (url.pathname || "/").toString();
  const host = getHost(req);

  // Always allow Next internals + static
  if (pathname.startsWith("/_next/")) return NextResponse.next();
  if (pathname.startsWith("/assets/")) return NextResponse.next();

  // Always allow proof/public endpoints and protected paths
  if (startsWithAny(pathname, ALLOW_PREFIXES)) return NextResponse.next();
  if (startsWithAny(pathname, PROTECTED_PREFIXES)) return NextResponse.next();

  // ===== STAGING BYPASS =====
  if (host === STAGING_HOST) {
    // Fastest "I SEE A WEBSITE" win: force staging root to /live
    if (pathname === "/") {
      const u = req.nextUrl.clone();
      u.pathname = "/live";
      return NextResponse.rewrite(u);
    }
    // Otherwise: allow normal routing on staging
    return NextResponse.next();
  }

  // ===== PROD TV LOCK =====
  // For dominat8.io + www, rewrite everything to /io (TV shell architecture)
  if (PROD_HOSTS.has(host)) {
    const u = req.nextUrl.clone();
    u.pathname = "/io";
    return NextResponse.rewrite(u);
  }

  // Default behavior for any other host: DO NOT surprise-route; just pass through.
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
