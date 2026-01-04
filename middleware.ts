import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes = anyone can view, even signed out
 * Everything else = requires login
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/templates",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // ✅ Protect everything except public routes
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes except Next.js internals + static files
    "/((?!_next|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|webp|txt|map)).*)",
    // Always run middleware for API routes
    "/(api|trpc)(.*)",
  ],
};
