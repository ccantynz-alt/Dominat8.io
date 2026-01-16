import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes:
 * - Published sites: /p/*
 * - Auth pages: /sign-in, /sign-up
 * - Public homepage + marketing (adjust if you want)
 * - Your Pages API endpoints used by publish flow (adjust if you want)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // Published sites must be public or you get redirect loops
  "/p(.*)",

  // Optional: keep these public for debugging / publishing flows
  "/api/__probe__(.*)",
  "/api/projects/(.*)/publish(.*)",
  "/api/projects/(.*)/seed-spec(.*)",
  "/api/projects/(.*)/agents/auto-publish(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // If you ever run a demo/no-auth mode, allow everything
  if (process.env.NEXT_PUBLIC_DEMO_AUTH === "true") return;

  // IMPORTANT: do not protect public routes
  if (isPublicRoute(req)) return;

  // Everything else is protected
  auth().protect();
});

export const config = {
  matcher: [
    // Run middleware on all routes except Next internals and static assets
    "/((?!_next|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|map)).*)",
    // Always run on API routes
    "/api/(.*)",
  ],
};
