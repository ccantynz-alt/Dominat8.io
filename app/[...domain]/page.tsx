import { kv } from "@vercel/kv";
import { headers } from "next/headers";

export const runtime = "nodejs";

export default async function DomainCatchAllPage({
  params,
}: {
  params: { domain: string[] };
}) {
  // Resolve the hostname from headers
  const headersList = headers();
  const host = headersList.get("host");

  if (!host) {
    return <h1>Invalid host</h1>;
  }

  // Strip port if present
  const domain = host.split(":")[0];

  // Read the stable index
  const index =
    (await kv.get<string[]>("projects:index:v2")) || [];

  let projectId: string | null = null;

  for (const id of index) {
    const project = await kv.hgetall<any>(`project:${id}`);
    if (
      project?.domain === domain &&
      project?.domainVerified === "true"
    ) {
      projectId = id;
      break;
    }
  }

  if (!projectId) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Domain not connected</h1>
        <p>This domain is not connected to any project.</p>
      </main>
    );
  }

  const html =
    await kv.get<string>(
      `generated:project:${projectId}:latest`
    );

  if (!html) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Site not published</h1>
        <p>This project has no published site yet.</p>
      </main>
    );
  }

  return (
    <iframe
      src={`/p/${projectId}`}
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
