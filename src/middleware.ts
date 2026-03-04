import { NextRequest, NextResponse } from "next/server";

// Subdomains that serve the main app (not user-deployed sites)
const RESERVED_SUBDOMAINS = new Set([
  "www", "staging", "preview", "dev", "api", "app", "admin", "mail",
]);

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
  "/dashboard",
  "/build",
  "/onboarding",
  "/video",
]);

// Path prefixes served directly
const DIRECT_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/api/",
  "/_next/",
  "/s/",
  "/tv/",
  "/admin",
  "/io",
  "/build/",
];

function shouldPassThrough(pathname: string): boolean {
  if (DIRECT_PATHS.has(pathname)) return true;
  return DIRECT_PREFIXES.some((p) => pathname.startsWith(p));
}

function routingHandler(request: NextRequest): NextResponse {
  const { pathname, hostname } = request.nextUrl;

  // ── Subdomain routing: {slug}.dominat8.io → /api/subdomain/{slug} ──────────
  const appHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : "dominat8.io";

  if (hostname !== appHost && hostname !== "localhost" && !hostname.includes("vercel.app")) {
    if (hostname.endsWith(`.${appHost}`)) {
      const slug = hostname.replace(`.${appHost}`, "");
      if (!RESERVED_SUBDOMAINS.has(slug)) {
        const url = request.nextUrl.clone();
        url.pathname = `/api/subdomain/${encodeURIComponent(slug)}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  if (shouldPassThrough(pathname)) return NextResponse.next();

  // Everything else (e.g. /some-slug) → /io admin cockpit
  const url = request.nextUrl.clone();
  url.pathname = "/io";
  return NextResponse.rewrite(url);
}

// Only use Clerk middleware if the publishable key is configured.
// Without it, clerkMiddleware throws asynchronously ("Missing publishableKey"),
// causing a 500 on every request.
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let clerkWrapped: ((req: NextRequest, evt: any) => Promise<NextResponse>) | null = null;
if (hasClerkKey) {
  try {
    const { clerkMiddleware } = require("@clerk/nextjs/server");
    clerkWrapped = clerkMiddleware((_auth: any, request: NextRequest) => {
      return routingHandler(request);
    });
  } catch {
    // Clerk module failed to load — fall back to plain routing
  }
}

export default async function middleware(request: NextRequest) {
  if (clerkWrapped) {
    try {
      return await clerkWrapped(request, {} as any);
    } catch {
      // Clerk runtime error — fall back to plain routing
      return routingHandler(request);
    }
  }
  return routingHandler(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
