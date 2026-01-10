import { notFound } from "next/navigation";

type PageProps = {
  params: { projectId: string };
};

export default async function PublicProjectPage({ params }: PageProps) {
  const { projectId } = params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/public`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  if (!data?.html) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: data.html }}
      style={{ minHeight: "100vh" }}
    />
  );
}
