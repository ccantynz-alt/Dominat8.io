// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * CRITICAL:
 * - Pages API must own /api/*
 * - Middleware must NOT intercept /api routes
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p(.*)",

  // Always-public debug/probe endpoints (Pages API)
  "/api/__probe__",
  "/api/__probe2__",
  "/api/__probe_debug_spec__",
  "/api/__deploy_bump__",

  // Spec inspector
  "/api/projects/(.*)/debug/spec",
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // ✅ Let Pages API handle everything under /api
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protect non-public pages
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
