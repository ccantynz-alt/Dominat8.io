// src/app/projects/[projectId]/domains/page.tsx

import type { Metadata } from "next";
import DomainsClient from "./DomainsClient";

export const metadata: Metadata = {
  title: "Domains",
  description: "Attach and verify a custom domain for this project.",
};

export default function Page({ params }: { params: { projectId: string } }) {
  return <DomainsClient projectId={params.projectId} />;
}
