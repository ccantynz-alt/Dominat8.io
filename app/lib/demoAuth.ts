import "server-only";

/**
 * DEMO AUTH (SAFE STUB)
 * Always returns a deterministic user id for now.
 */

export async function getCurrentUserId(): Promise<string | null> {
  return "demo-user";
}
