// /middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that should be public (no auth required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p/(.*)", // published sites should be public
  "/billing/success",
  "/billing/cancel",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that is not public
  if (!isPublicRoute(req)) {
    // ✅ In your Clerk version, protect is async
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all routes except static files and Next internals
    "/((?!.*\\..*|_next).*)",
    "/",
    // Match API routes
    "/(api|trpc)(.*)",
  ],
};
