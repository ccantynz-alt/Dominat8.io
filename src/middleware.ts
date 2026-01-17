import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (add to this list as needed)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/__probe_pages__(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // IMPORTANT: Never run middleware auth on /api routes (agents live here)
  if (req.nextUrl.pathname.startsWith("/api")) return;

  if (isPublicRoute(req)) return;

  auth().protect();
});

export const config = {
  // IMPORTANT: Exclude /api from middleware matching.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
