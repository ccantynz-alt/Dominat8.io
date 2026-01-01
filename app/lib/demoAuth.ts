import { auth } from "@clerk/nextjs/server";

/**
 * Server-side user id helper.
 * - If signed in via Clerk → returns Clerk userId
 * - If not signed in → returns "demo"
 *
 * This lets your existing routes compile and run without breaking.
 * Later you can tighten this to require auth().
 */
export function getCurrentUserId(): string {
  const { userId } = auth();
  return userId ?? "demo";
}
