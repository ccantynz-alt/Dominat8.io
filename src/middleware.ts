import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const MAIN_HOSTS = new Set(['dominat8.io', 'www.dominat8.io', 'localhost']);

// Builder and cockpit require sign-in
const isProtectedRoute = createRouteMatcher([
  '/',
  '/io',
  '/io/(.*)',
  '/cockpit',
  '/cockpit/(.*)',
]);

// Exact paths served directly (not rewritten to /io)
const DIRECT_PATHS = new Set([
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
  // Metadata / static assets (Next.js app router)
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
]);

// Path prefixes served directly (cockpit is protected below, not passed through)
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

export default clerkMiddleware(async (auth, request: NextRequest) => {
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

  // Let icon and metadata routes through first — no auth, no rewrite (browsers/crawlers hit these without cookies)
  if (shouldPassThrough(pathname)) return NextResponse.next();

  // Protect builder and cockpit — redirect to sign-in if not authenticated
  if (isProtectedRoute(request)) {
    await (await auth()).protect();
  }

  // Root serves the Builder. Cockpit paths serve as-is. All other paths → /io.
  if (pathname === '/') return NextResponse.next();
  if (pathname.startsWith('/cockpit')) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/io";
  return NextResponse.rewrite(url);
});

export const config = {
  // Exclude static assets and metadata routes so they never hit Clerk (avoids any auth/redirect)
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image).*)"],
};
