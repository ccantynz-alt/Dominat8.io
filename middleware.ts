import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/public(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that is NOT public
  if (!isPublicRoute(req)) {
    const a = await auth();
    a.protect();
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes except Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run on API routes
    "/api/(.*)",
  ],
};
