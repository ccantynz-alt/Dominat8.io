export function isAdminUserId(userId: string | null | undefined) {
  if (!userId) return false;

  const raw = process.env.ADMIN_USER_IDS || "";
  const admins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return admins.includes(userId);
}
