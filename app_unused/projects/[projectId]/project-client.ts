// app/projects/[projectId]/project-client.ts

export type Project = {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
};

export async function fetchProject(projectId: string): Promise<Project | null> {
  const res = await fetch(`/api/projects/${projectId}`);

  if (!res.ok) return null;

  const json = await res.json();
  return json?.project ?? null;
}
