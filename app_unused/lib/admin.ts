// app/lib/admin.ts

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * QUICK HARDENING:
 * Admin = userId is in ADMIN_USER_IDS.
 * No email checks, no Clerk client calls.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const adminUserIds = parseCsvEnv(process.env.ADMIN_USER_IDS);
  return adminUserIds.includes(userId);
}
