import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * MIDDLEWARE DISABLED (temporary, safe)
 * Prevents MIDDLEWARE_INVOCATION_FAILED by matching NOTHING.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
