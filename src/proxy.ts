/**
 * Next.js 16 Proxy (replaces deprecated middleware.ts).
 * Uses clerkMiddleware() from @clerk/nextjs/server when Clerk is configured.
 * When Clerk is not set (e.g. CI), uses a pass-through so the app doesn't crash.
 * Handles: admin-key protection, custom domain rewrites, and /io rewrite.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const HAS_CLERK = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
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

async function handleRequest(request: NextRequest): Promise<NextResponse> {
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

  if (shouldPassThrough(pathname)) return NextResponse.next();

  if (pathname === "/") return NextResponse.next();
  if (pathname.startsWith("/cockpit")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/io";
  return NextResponse.rewrite(url);
}

const clerkHandler = HAS_CLERK
  ? clerkMiddleware(async (_auth, request: NextRequest) => handleRequest(request))
  : async (request: NextRequest, _event: NextFetchEvent) => handleRequest(request);

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname || "/";

  if (startsWithAny(pathname, ALLOW_PREFIXES)) return clerkHandler(request, event);
  if (pathname.startsWith("/_next/")) return clerkHandler(request, event);

  if (startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const adminKey = process.env.ADMIN_API_KEY?.trim() || "";
    if (!adminKey) return clerkHandler(request, event);
    const hdr =
      request.headers.get("x-admin-key") ||
      request.headers.get("x-d8-admin-key") ||
      request.headers.get("x-dom-admin-key") ||
      "";
    const q = request.nextUrl.searchParams.get("admin_key") || "";
    if (hdr === adminKey || q === adminKey) return clerkHandler(request, event);
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image).*)",
    "/(api|trpc)(.*)",
  ],
};
