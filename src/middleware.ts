import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SAFE NO-OP middleware (temporary)
 * Prevents Edge runtime crashes: MIDDLEWARE_INVOCATION_FAILED
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

