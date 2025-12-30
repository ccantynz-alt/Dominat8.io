// app/dashboard/projects/page.tsx
import { listProjects } from "@/app/lib/store";
import ProjectsRoute from "./ProjectsRoute";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectsRoute initialProjects={projects} />;
}
