// src/app/projects/[projectId]/terminal/page.tsx
import type { Metadata } from "next";
import ProjectTerminal from "@/components/terminal/ProjectTerminal";

export const metadata: Metadata = {
  title: "Project Terminal",
  description: "Run the canonical agent pipeline and view step-by-step results.",
};

export default function ProjectTerminalPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectTerminal projectId={params.projectId} />;
}
