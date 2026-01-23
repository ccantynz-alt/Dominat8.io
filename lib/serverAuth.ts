import { auth } from "@clerk/nextjs/server";

/**
 * Always returns a userId or null.
 * Safe for API routes.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session.userId ?? null;
}
