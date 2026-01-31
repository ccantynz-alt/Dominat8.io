/* ===== IO_ROCKET_COCKPIT_v1_20260131 : CACHE NUKE ===== */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("cache-control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.headers.set("pragma", "no-cache");
  res.headers.set("expires", "0");
  res.headers.set("surrogate-control", "no-store");
  res.headers.set("x-d8io-cache-nuke", "1");
  return res;
}

export const config = {
  matcher: ["/", "/api/__d8__/:path*", "/api/io/:path*"],
};