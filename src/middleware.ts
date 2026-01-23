import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/__probe_pages__(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // CRITICAL: never run auth middleware on /api routes (agents live here)
  if (req.nextUrl.pathname.startsWith("/api")) return;

  if (isPublicRoute(req)) return;

  auth().protect();
});

export const config = {
  // CRITICAL: exclude /api from matcher completely
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
