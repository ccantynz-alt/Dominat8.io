import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next(); res.headers.set("x-dominat8-mw", "1"); return res;
}
// Do NOT rewrite/redirect routes here. Just set anti-cache headers.
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/__probe__",
    "/api/__ping__",
  ],
};