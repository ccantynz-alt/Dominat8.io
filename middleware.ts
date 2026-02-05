import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ===== D8_STAGING_BYPASS_V1 =====
const __D8_STAGING_HOST__ = "staging.dominat8.io";
function __d8_is_staging_host__(req: any): boolean {
  try {
    const h = (req?.headers?.get?.("host") || req?.headers?.host || "").toString().toLowerCase();
    return h === __D8_STAGING_HOST__;
  } catch { return false; }
}
// ===== /D8_STAGING_BYPASS_V1 =====


const PROTECTED_PREFIXES: string[] = ["/admin","/cockpit","/agents","/api/agents","/api/engine","/api/admin","/api/cockpit"];
const ALLOW_PREFIXES: string[] = ["/api/__d8__/stamp","/stamp","/healthz","/robots.txt","/sitemap.xml","/favicon.ico"];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  for (const p of prefixes) {
    if (pathname === p) return true;
    if (pathname.startsWith(p + "/")) return true;
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  // ===== D8_STAGING_BYPASS_V1 early bypass =====
  // Keep dominat8.io locked to TV, but allow staging host to render normal site.
  if (__d8_is_staging_host__(req)) {
    return NextResponse.next();
  }
  // ===== /D8_STAGING_BYPASS_V1 early bypass =====

  const url = req.nextUrl;
  const pathname = url.pathname || "/";

  // Always allow proof/public endpoints and static assets
  if (startsWithAny(pathname, ALLOW_PREFIXES)) return NextResponse.next();
  if (pathname.startsWith("/_next/")) return NextResponse.next();

  // Only guard the sensitive surfaces
  if (!startsWithAny(pathname, PROTECTED_PREFIXES)) return NextResponse.next();

  const adminKey = process.env.ADMIN_API_KEY || "";
  if (!adminKey) return new NextResponse("Unauthorized", { status: 401 });

  const hdr =
    req.headers.get("x-admin-key") ||
    req.headers.get("x-d8-admin-key") ||
    req.headers.get("x-dom-admin-key") ||
    "";

  const q = url.searchParams.get("admin_key") || "";

  if (hdr === adminKey || q === adminKey) return NextResponse.next();

  return new NextResponse("Unauthorized", { status: 401 });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cockpit/:path*",
    "/agents/:path*",
    "/api/agents/:path*",
    "/api/engine/:path*",
    "/api/admin/:path*",
    "/api/cockpit/:path*"
  ]
};

