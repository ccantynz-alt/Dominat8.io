// app/lib/isAdmin.ts
import { cookies } from "next/headers";
import { getCurrentUserId } from "./demoAuth";

/**
 * Admin rules (in order):
 * 1) If admin session cookie exists => admin
 * 2) Else fall back to existing demo auth => admin if userId exists
 *
 * This keeps your current dev flow working, while adding a real “Admin Access” page.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const c = cookies();
    const session = c.get("admin_session")?.value;
    if (session === "1") return true;
  } catch {
    // ignore
  }

  try {
    const userId = await getCurrentUserId();
    return !!userId;
  } catch {
    return false;
  }
}
