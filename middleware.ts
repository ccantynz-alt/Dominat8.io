import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  const res = NextResponse.next();

  if (p === "/__probe__" || p === "/api/__probe__") {
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
  }

  return res;
}

export const config = { matcher: ["/__probe__", "/api/__probe__"] };
