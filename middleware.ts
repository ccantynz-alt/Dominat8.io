import { NextRequest, NextResponse } from "next/server";
import { getDomainProjectMapping, normalizeDomain } from "@/app/lib/domainRoutingStore";

const PLATFORM_HOST_SUFFIXES = [
  ".vercel.app",
  ".localhost",
];

function isPlatformHost(host: string) {
  if (host === "localhost" || host.startsWith("localhost:")) return true;
  return PLATFORM_HOST_SUFFIXES.some((s) => host.endsWith(s));
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const hostHeader = req.headers.get("host") || "";
  const host = normalizeDomain(hostHeader);

  // If this is the platform host (localhost / vercel), do nothing.
  if (!host || isPlatformHost(host)) {
    return NextResponse.next();
  }

  // Canonicalize www -> apex (but keep the request working)
  const canonicalHost = host.startsWith("www.") ? host.slice(4) : host;

  // If www, redirect to apex
  if (canonicalHost !== host) {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = canonicalHost;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Resolve domain → projectId
  const projectId = await getDomainProjectMapping(canonicalHost);

  if (!projectId) {
    // Domain not mapped: send user to a friendly page on the platform
    const fallback = req.nextUrl.clone();
    fallback.pathname = "/domain-not-connected";
    fallback.searchParams.set("domain", canonicalHost);
    return NextResponse.rewrite(fallback);
  }

  // Preserve path: /pricing -> /p/[projectId]/pricing
  const path = url.pathname || "/";
  url.pathname = `/p/${projectId}${path === "/" ? "" : path}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
