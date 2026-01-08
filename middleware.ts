import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",                // landing
  "/pricing(.*)",     // pricing page + subroutes
  "/api/stripe/webhook", // Stripe webhook must be public
  "/p(.*)",           // public published sites (future)
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

export default clerkMiddleware((auth, req) => {
  // If the request is NOT public, enforce authentication.
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes except Next.js internals and static files.
    "/((?!_next|.*\\.(?:css|js|json|png|jpg|jpeg|gif|svg|ico|webp|txt|map)$).*)",
    "/(api|trpc)(.*)"
  ]
};
