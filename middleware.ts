// /middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (no login required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p/(.*)",            // published sites should stay public
  "/generated(.*)",     // if you have a generated preview route
  "/api/public(.*)",    // optional: keep if you ever add public APIs
]);

export default clerkMiddleware((auth, req) => {
  // Protect everything that is not public
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // This matcher is Clerk’s recommended setup for Next.js App Router
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!.*\\..*|_next).*)",
    "/",
    // Match API routes
    "/(api|trpc)(.*)",
  ],
};
