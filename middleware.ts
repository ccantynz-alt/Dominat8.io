import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cockpit is protected by Clerk (sign-in) in src/middleware.ts — do not require admin key here
const PROTECTED_PREFIXES: string[] = ["/admin","/agents","/api/agents","/api/engine","/api/admin"];
const ALLOW_PREFIXES: string[] = ["/api/__d8__/stamp","/stamp","/healthz","/robots.txt","/sitemap.xml","/favicon.ico","/icon","/apple-icon","/opengraph-image","/twitter-image"];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  for (const p of prefixes) {
    if (pathname === p) return true;
    if (pathname.startsWith(p + "/")) return true;
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
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
    "/agents/:path*",
    "/api/agents/:path*",
    "/api/engine/:path*",
    "/api/admin/:path*"
  ]
};
