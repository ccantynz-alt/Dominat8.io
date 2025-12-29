// app/lib/demoAuth.ts
import "server-only";

/**
 * Temporary demo auth.
 * This MUST always return a stable userId.
 */
export async function getCurrentUserId(): Promise<string> {
  // In production, replace this with real auth (Clerk, Auth.js, etc)
  return "demo-user";
}
