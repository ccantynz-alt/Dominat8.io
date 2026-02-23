import { clerkMiddleware } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const MAIN_HOSTS = new Set(['dominat8.io', 'www.dominat8.io', 'localhost']);

// Exact paths served directly (not rewritten to /io)
const DIRECT_PATHS = new Set([
  "/",
  "/pricing",
  "/about",
  "/gallery",
  "/templates",
  "/privacy",
  "/terms",
  "/tv",
  "/healthz",
  "/deploy",
  "/domain",
  "/ssl",
  "/monitor",
  "/logs",
  "/fix",
  "/animate",
  "/integrate",
  "/settings",
]);

// Path prefixes served directly
const DIRECT_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/api/",
  "/_next/",
  "/s/",
  "/tv/",
  "/io/",
];

function shouldPassThrough(pathname: string): boolean {
  if (DIRECT_PATHS.has(pathname)) return true;
  return DIRECT_PREFIXES.some((p) => pathname.startsWith(p));
}

export default clerkMiddleware(async (_auth, request: NextRequest) => {
  const host = request.headers.get('host') || '';
  const hostname = host.replace(/:\d+$/, '');

  // Custom domain serving: verified domains rewrite to /s/[siteId]
  if (!MAIN_HOSTS.has(hostname) && !hostname.endsWith('.vercel.app')) {
    try {
      const siteId = await kv.get<string>(`domain:verified:${hostname}`);
      if (siteId) {
        const url = request.nextUrl.clone();
        url.pathname = `/s/${siteId}`;
        return NextResponse.rewrite(url);
      }
    } catch { /* KV unavailable, fall through */ }
  }

  const { pathname } = request.nextUrl;
  if (shouldPassThrough(pathname)) return NextResponse.next();

  // Root serves the Builder (AI website generator). All other paths → /io cockpit.
  if (pathname === '/') return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/io";
  return NextResponse.rewrite(url);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
