import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function parseAdminIds(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function maskId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 9)}...${id.slice(-4)}`;
}

export default async function WhoAmIPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const raw = process.env.ADMIN_USER_IDS || "";
  const list = parseAdminIds(raw);
  const isAdmin = list.includes(userId);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Who Am I (Debug)
      </h1>

      <p style={{ marginBottom: 16 }}>
        This page shows your Clerk <code>userId</code> and whether Vercel can see{" "}
        <code>ADMIN_USER_IDS</code>.
      </p>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Your Clerk User ID
        </h2>
        <p style={{ margin: 0 }}>
          <strong>userId:</strong> <code>{userId}</code>
        </p>
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Vercel ENV Check
        </h2>

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>ADMIN_USER_IDS is set:</strong>{" "}
          <code>{raw ? "YES" : "NO"}</code>
        </p>

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Admin IDs found:</strong> <code>{list.length}</code>
        </p>

        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Does it include your userId?</strong>{" "}
          <code>{isAdmin ? "YES" : "NO"}</code>
        </p>

        {list.length > 0 && (
          <>
            <p style={{ margin: "12px 0 6px 0", fontWeight: 700 }}>
              Admin IDs (masked preview):
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              {list.map((id) => (
                <li key={id}>
                  <code>{maskId(id)}</code>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          What to do next
        </h2>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            Copy your exact <code>userId</code> above.
          </li>
          <li>
            In Vercel, set <code>ADMIN_USER_IDS</code> to that exact value.
          </li>
          <li>Redeploy.</li>
          <li>Try <code>/admin</code> again.</li>
        </ol>
      </div>
    </main>
  );
}

