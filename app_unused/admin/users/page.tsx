import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function isAdminUserId(userId: string) {
  // Comma-separated list of Clerk user IDs in Vercel env:
  // ADMIN_USER_IDS=user_123,user_456
  const raw = process.env.ADMIN_USER_IDS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return list.includes(userId);
}

export default async function AdminUsersPage() {
  // ✅ FIX: auth() returns a Promise in your current Clerk typings/build
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  if (!isAdminUserId(userId)) redirect("/projects");

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Admin — Users
      </h1>

      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        This page is currently stubbed (safe placeholder). You are signed in as:{" "}
        <code>{userId}</code>
      </p>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Planned Features
        </h2>
        <ul style={{ lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
          <li>List users (Clerk API)</li>
          <li>Search/filter</li>
          <li>Assign roles (admin/user)</li>
          <li>Disable/ban users</li>
        </ul>
      </div>
    </main>
  );
}

