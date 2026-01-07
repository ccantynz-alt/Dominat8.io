import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  const isLocalhost =
    host.includes("localhost") || host.includes("127.0.0.1");

  // 1️⃣ Enforce HTTPS (Vercel sets x-forwarded-proto)
  const proto = req.headers.get("x-forwarded-proto");

  if (!isLocalhost && proto !== "https") {
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // 2️⃣ Redirect www → apex
  if (host.startsWith("www.")) {
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

// Apply to everything
export const config = {
  matcher: "/:path*",
};
