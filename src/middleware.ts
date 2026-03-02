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
  "/io",
  "/build",
];

function shouldPassThrough(pathname: string): boolean {
  if (DIRECT_PATHS.has(pathname)) return true;
  return DIRECT_PREFIXES.some((p) => pathname.startsWith(p));
}

export default clerkMiddleware((_auth, request: NextRequest) => {
  const { pathname, hostname } = request.nextUrl;

  // ── Subdomain routing: {slug}.dominat8.io → /api/subdomain/{slug} ──────────
  const appHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : "dominat8.io";

  if (hostname !== appHost && hostname !== "localhost" && !hostname.includes("vercel.app")) {
    // Check if it's a subdomain of our app
    if (hostname.endsWith(`.${appHost}`)) {
      const slug = hostname.replace(`.${appHost}`, "");
      // Reserved subdomains (staging, www, etc.) serve the main app
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
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
