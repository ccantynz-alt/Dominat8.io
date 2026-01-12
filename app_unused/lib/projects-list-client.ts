// app/lib/projects-list-client.ts

export type Project = {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
};

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects/list");

  if (!res.ok) return [];

  const json = await res.json();
  return Array.isArray(json.projects) ? json.projects : [];
}
