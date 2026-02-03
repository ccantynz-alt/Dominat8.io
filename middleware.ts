import { NextRequest, NextResponse } from "next/server";

const IO_HOSTS = new Set<string>([
  "dominat8.io",
  "www.dominat8.io",
]);

function isStaticOrApi(pathname: string): boolean {
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  if (pathname === "/site.webmanifest") return true;
  return false;
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // dominat8.io invariant: never render marketing routes.
  if (IO_HOSTS.has(host)) {
    if (isStaticOrApi(pathname)) return NextResponse.next();

    // Allow /io itself
    if (pathname === "/io" || pathname.startsWith("/io/")) return NextResponse.next();

    // Rewrite everything else to /io while preserving URL in browser.
    const url = req.nextUrl.clone();
    url.pathname = "/io";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};