import { clerkMiddleware } from "@clerk/nextjs/server";
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
  "/build/",
  "/io",
];

function shouldPassThrough(pathname: string): boolean {
  if (DIRECT_PATHS.has(pathname)) return true;
  return DIRECT_PREFIXES.some((p) => pathname.startsWith(p));
}

// Safely resolve the app hostname (guards against invalid NEXT_PUBLIC_APP_URL)
function getAppHost(): string {
  try {
    const raw = process.env.NEXT_PUBLIC_APP_URL;
    if (raw) return new URL(raw).hostname;
  } catch {
    // invalid URL — fall through to default
  }
  return "dominat8.io";
}

// Core routing logic — extracted so both Clerk and fallback paths share it
function handleRouting(request: NextRequest): NextResponse {
  const { pathname, hostname } = request.nextUrl;
  const appHost = getAppHost();

  // ── Subdomain routing: {slug}.dominat8.io → /api/subdomain/{slug} ──────────
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

// Detect whether Clerk keys are configured
const clerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

// When Clerk is configured, wrap with clerkMiddleware for auth context.
// When keys are missing, skip Clerk entirely so the site still serves
// instead of crashing with MIDDLEWARE_INVOCATION_FAILED.
const middleware = clerkConfigured
  ? clerkMiddleware((_auth, request: NextRequest) => {
      try {
        return handleRouting(request);
      } catch {
        return NextResponse.next();
      }
    })
  : function fallbackMiddleware(request: NextRequest) {
      try {
        return handleRouting(request);
      } catch {
        return NextResponse.next();
      }
    };

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
