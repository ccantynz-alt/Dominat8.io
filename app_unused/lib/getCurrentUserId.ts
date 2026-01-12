import { auth } from "@clerk/nextjs/server";

/**
 * Helper for API routes: always awaits Clerk auth correctly.
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId ?? null;
}
