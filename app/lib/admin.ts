// app/lib/admin.ts

import { clerkClient } from "@clerk/nextjs/server";

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Admin allowlist logic:
 * - If userId is in ADMIN_USER_IDS => admin
 * - Else if user's email is in ADMIN_EMAILS => admin
 * - Else => not admin
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const adminUserIds = parseCsvEnv(process.env.ADMIN_USER_IDS);
  const adminEmails = parseCsvEnv(process.env.ADMIN_EMAILS).map((e) =>
    e.toLowerCase()
  );

  // Fast path: userId allowlist
  if (adminUserIds.includes(userId)) return true;

  // If no email allowlist is configured, stop here.
  if (adminEmails.length === 0) return false;

  // Otherwise, check Clerk user's emails
  try {
    const user = await clerkClient.users.getUser(userId);

    const emails =
      user.emailAddresses?.map((e) => (e.emailAddress || "").toLowerCase()) ??
      [];

    return emails.some((e) => adminEmails.includes(e));
  } catch {
    return false;
  }
}
