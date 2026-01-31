import React from "react";
import { ProjectVideoAutoEmbed } from "@/app/projects/_components/ProjectVideoAutoEmbed";

export const runtime = "nodejs";

export default function Layout(props: { children: React.ReactNode; params: { projectId: string } }) {
  const projectId = props.params.projectId;

  return (
    <>
      {props.children}
      <ProjectVideoAutoEmbed projectId={projectId} />
    </>
  );
}