// lib/isAdmin.ts
import { getCurrentUserId } from "./demoAuth";

/**
 * Minimal admin check for now.
 * If you’re using Clerk later, we’ll swap this to Clerk auth/roles.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    return !!userId;
  } catch {
    return false;
  }
}
