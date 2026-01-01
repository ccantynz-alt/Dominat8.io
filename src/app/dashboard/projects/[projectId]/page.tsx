type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: string;
  createdAt: string;
};

type Project = { id: string; name: string; createdAt: string };

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const projRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects`, {
    cache: "no-store",
  });
  const projData = (await projRes.json()) as { ok: boolean; projects: Project[] };
  const project = (projData.projects ?? []).find((p) => p.id === projectId);

  const runsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects/${projectId}/runs`,
    { cache: "no-store" }
  );
  const runsData = (await runsRes.json()) as { ok: boolean; runs: Run[] };
  const runs = runsData?.runs ?? [];

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        {project ? project.name : "Project"}
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Project ID: <code>{projectId}</code>
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Create Run</h2>

        <form
          action={`/api/projects/${projectId}/runs`}
          method="POST"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "720px" }}
        >
          <textarea
            name="prompt"
            required
            defaultValue="Build a modern landing page website with pricing, FAQ, and a contact form. Use clean, minimal styling."
            rows={5}
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontFamily: "system-ui",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.25rem",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Create Run
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Runs</h2>

        {runs.length === 0 ? (
          <p>No runs yet.</p>
        ) : (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {runs
              .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
              .map((r) => (
                <li key={r.id} style={{ marginBottom: "0.75rem" }}>
                  <div>
                    <strong>{r.status}</strong>{" "}
                    <span style={{ color: "#777" }}>
                      ({new Date(r.createdAt).toLocaleString()})
                    </span>
                  </div>
                  <div style={{ color: "#444" }}>
                    <code>{r.id}</code>
                  </div>
                  <div style={{ marginTop: "0.25rem" }}>{r.prompt}</div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
