import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  
  // DXL_MIDDLEWARE_ALLOW_AUTHCHECK_20260129
  // Allow DXL admin auth-check endpoints to bypass middleware gating.
  // This does NOT leak secrets; it only enables routing.
  const __dxlPath = (req as any)?.nextUrl?.pathname ?? "";
  if (__dxlPath === "/api/dxl/auth-check" || __dxlPath === "/api/__where__/dxl-auth-check") {
    return NextResponse.next();
  }const p = req.nextUrl.pathname;
  const res = NextResponse.next();

  if (p === "/__probe__" || p === "/api/__probe__") {
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
  }

  return res;
}

export const config = { matcher: ["/__probe__", "/api/__probe__"] };
