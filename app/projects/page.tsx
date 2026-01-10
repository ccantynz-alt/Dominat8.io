import Link from "next/link";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type Project = {
  id: string;
  name: string;
};

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

export default async function ProjectsListPage() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const ids = (await kv.lrange(userProjectsKey(userId), 0, 50)) as string[];
  const projects: Project[] = [];

  for (const id of ids) {
    const p = await kv.get<Project>(projectKey(id));
    if (p) projects.push(p);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Your projects</h1>

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
