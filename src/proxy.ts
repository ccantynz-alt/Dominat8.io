/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts).
 * Uses clerkMiddleware() from @clerk/nextjs/server per official Clerk + App Router docs.
 * Handles: admin-key protection, custom domain rewrites, and /io rewrite.
 * Route protection (/, /io, /cockpit) is done in App Router via auth() in pages/layouts —
 * auth() in proxy context can trigger "headers is a symbol" in some runtimes.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const MAIN_HOSTS = new Set(["dominat8.io", "www.dominat8.io", "localhost"]);

// Admin-key protection (merged from root middleware)
const PROTECTED_PREFIXES = ["/admin", "/agents", "/api/agents", "/api/engine", "/api/admin"];
const ALLOW_PREFIXES = [
  "/api/__d8__/stamp",
  "/stamp",
  "/healthz",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p)
  );
}

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
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
]);

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

const clerkHandler = clerkMiddleware(async (auth, request: NextRequest) => {
  const host = request.headers.get("host") || "";
  const hostname = host.replace(/:\d+$/, "");

  if (!MAIN_HOSTS.has(hostname) && !hostname.endsWith(".vercel.app")) {
    try {
      const siteId = await kv.get<string>(`domain:verified:${hostname}`);
      if (siteId) {
        const url = request.nextUrl.clone();
        url.pathname = `/s/${siteId}`;
        return NextResponse.rewrite(url);
      }
    } catch {
      /* KV unavailable */
    }
  }

  const { pathname } = request.nextUrl;
  const adminKey = process.env.ADMIN_API_KEY?.trim() || "";
  
  // Check protected routes: require admin key OR Clerk authentication
  if (startsWithAny(pathname, PROTECTED_PREFIXES)) {
    if (!adminKey) {
      // No admin key configured - check Clerk auth for protected routes
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
  }

  if (shouldPassThrough(pathname)) return NextResponse.next();

  if (pathname === "/") return NextResponse.next();
  if (pathname.startsWith("/cockpit")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/io";
  return NextResponse.rewrite(url);
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname || "/";

  if (startsWithAny(pathname, ALLOW_PREFIXES)) return clerkHandler(request, event);
  if (pathname.startsWith("/_next/")) return clerkHandler(request, event);

  if (startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const adminKey = process.env.ADMIN_API_KEY?.trim() || "";
    // If admin key is configured, require it before passing to clerkHandler
    if (adminKey) {
      const hdr =
        request.headers.get("x-admin-key") ||
        request.headers.get("x-d8-admin-key") ||
        request.headers.get("x-dom-admin-key") ||
        "";
      if (hdr !== adminKey) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
    // If no admin key or admin key valid, pass to clerkHandler which will:
    // 1. Check Clerk auth if no admin key was configured
    // 2. Set up auth context for route handlers
    return clerkHandler(request, event);
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image).*)",
    "/(api|trpc)(.*)",
  ],
};
