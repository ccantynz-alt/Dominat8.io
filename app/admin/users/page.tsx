import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUserId } from "../../../lib/admin";

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: number | null;
  lastSignInAt: number | null;
  banned: boolean;
  locked: boolean;
};

async function fetchUsers(): Promise<AdminUser[]> {
  try {
    const res = await fetch(`/api/admin/users?limit=50&offset=0`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    return data?.ok ? (data.users as AdminUser[]) : [];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");
  if (!isAdminUserId(userId)) redirect("/projects");

  const users = await fetchUsers();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Admin · Users</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>All Clerk users (first 50)</div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>Admin Home</Link>
          <Link href="/projects" style={{ textDecoration: "underline" }}>Projects</Link>
          <Link href="/templates" style={{ textDecoration: "underline" }}>Templates</Link>
        </div>
      </div>

      <hr style={{ margin: "18px 0" }} />

      {users.length === 0 ? (
        <div style={{ opacity: 0.85 }}>
          No users returned.
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            Make sure you are signed in as an admin and that <code>ADMIN_USER_IDS</code> is set in Vercel.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 10 }}>User</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 10 }}>Email</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 10 }}>Created</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 10 }}>Last sign-in</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 10 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "(no name)";
                const created = u.createdAt ? new Date(u.createdAt).toLocaleString() : "—";
                const lastSignIn = u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : "—";

                let status = "Active";
                if (u.banned) status = "Banned";
                if (u.locked) status = "Locked";

                return (
                  <tr key={u.id}>
                    <td style={{ borderBottom: "1px solid #f2f2f2", padding: 10 }}>
                      <div style={{ fontWeight: 600 }}>{fullName}</div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>{u.id}</div>
                    </td>
                    <td style={{ borderBottom: "1px solid #f2f2f2", padding: 10 }}>{u.email || "—"}</td>
                    <td style={{ borderBottom: "1px solid #f2f2f2", padding: 10 }}>{created}</td>
                    <td style={{ borderBottom: "1px solid #f2f2f2", padding: 10 }}>{lastSignIn}</td>
                    <td style={{ borderBottom: "1px solid #f2f2f2", padding: 10 }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
