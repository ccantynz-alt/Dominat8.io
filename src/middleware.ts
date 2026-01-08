import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ NEVER rewrite/handle API routes or Next internal routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // ✅ Allow everything else normally
  return NextResponse.next();
}

export const config = {
  // Run on everything except internal Next static paths
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
