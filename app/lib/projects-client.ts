// app/lib/projects-client.ts

export type CreateProjectResult =
  | { ok: true; project: { id: string; userId: string; name: string; createdAt: number } }
  | { ok: false; status: number; error: string };

export async function createProjectClient(name: string): Promise<CreateProjectResult> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const text = await res.text();

  // Try to parse JSON, but never crash UI if it isn't JSON
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }

  if (res.ok && json?.ok && json?.project) {
    return { ok: true, project: json.project };
  }

  const error =
    json?.error ||
    json?.message ||
    (typeof text === "string" && text.trim() ? text.trim() : "Request failed");

  return { ok: false, status: res.status, error };
}
