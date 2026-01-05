import { auth } from "@clerk/nextjs/server";

/**
 * Browser-safe helper for API routes.
 * Always await Clerk auth correctly.
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId ?? null;
}
