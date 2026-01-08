// app/lib/projects-client.ts

export type CreateProjectResult =
  | {
      ok: true;
      status: number;
      project: {
        id: string;
        userId: string;
        name: string;
        createdAt: number;
      };
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function createProjectClient(
  name: string
): Promise<CreateProjectResult> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const status = res.status;

  // Try JSON first, fallback to text
  let data: any = null;
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (status >= 200 && status < 300) {
    // Expected shape: { ok: true, project: {...} }
    const project = data?.project;
    if (project) {
      return { ok: true, status, project };
    }
    return {
      ok: false,
      status,
      error: "Project created but response was missing project data.",
    };
  }

  return {
    ok: false,
    status,
    error: data?.error || data?.message || text || "Request failed",
  };
}
