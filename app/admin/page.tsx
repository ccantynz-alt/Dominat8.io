export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      <p>This is the admin area.</p>

      <ul>
        <li>System status</li>
        <li>User roles</li>
        <li>Project moderation</li>
        <li>Billing controls</li>
      </ul>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        (We’ll lock this down to owner-only next.)
      </p>
    </main>
  );
}
