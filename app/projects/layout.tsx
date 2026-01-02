// app/projects/layout.tsx
import { redirect } from "next/navigation";
import { getPublicMode } from "../../lib/publicMode";
import { isAdmin } from "../../lib/isAdmin";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = await getPublicMode();
  const admin = await isAdmin();

  if (mode === "on" && !admin) {
    redirect("/");
  }

  return <>{children}</>;
}
