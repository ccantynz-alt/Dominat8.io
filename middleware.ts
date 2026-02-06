import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STAMP = 'D8_IO_MEGA_LAUNCH_20260206_151108';

/**
 * MEGA LAUNCH middleware:
 * - /io + staging paths MUST NOT be TV-locked.
 * - Add no-cache headers so you never fight stale HTML again.
 * - Keep everything else untouched.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const p = url.pathname || '/';

  const isBypass =
    p === '/io' ||
    p.startsWith('/io/') ||
    p === '/staging' ||
    p.startsWith('/staging/') ||
    p === '/_stage' ||
    p.startsWith('/_stage/') ||
    p === '/_stage/io' ||
    p.startsWith('/_stage/io/');

  // Always bypass for /io + staging paths
  if (isBypass) {
    const res = NextResponse.next();

    // Proof header
    res.headers.set('x-d8-proof', STAMP);

    // Nuclear no-cache
    res.headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.headers.set('pragma', 'no-cache');
    res.headers.set('expires', '0');

    return res;
  }

  // Default: do nothing (preserve existing behavior)
  const res = NextResponse.next();
  res.headers.set('x-d8-proof', STAMP);
  return res;
}

export const config = {
  matcher: [
    // Run for app routes, but ignore Next internals/static
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
