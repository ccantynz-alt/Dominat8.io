import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow Builder + probes explicitly
  if (
    pathname === "/api/__route_probe__" ||
    pathname.startsWith("/api/builder/")
  ) {
    return NextResponse.next();
  }

  // Default: allow everything else as-is
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico).*)",
    "/api/builder/:path*",
    "/api/__route_probe__"
  ]
};