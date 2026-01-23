import { auth } from "@clerk/nextjs/server";

export type AppUser = { id: string };

/**
 * Server-side auth helper.
 * - Returns { id } for the signed-in Clerk user.
 * - Throws if not signed in.
 */
export async function requireUser(): Promise<AppUser> {
  const { userId } = auth();

  if (!userId) {
    // Route handlers can let this throw; the caller should be authenticated.
    throw new Error("Unauthorized");
  }

  return { id: userId };
}
