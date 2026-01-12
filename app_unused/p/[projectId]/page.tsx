import { notFound } from "next/navigation";

type PageProps = {
  params: { projectId: string };
};

export default async function PublicProjectPage({ params }: PageProps) {
  const { projectId } = params;

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "";

  const url = base
    ? `${base}/api/projects/${projectId}/public`
    : `/api/projects/${projectId}/public`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) notFound();

  const data = await res.json();

  if (!data?.html) notFound();

  return (
    <div
      style={{ minHeight: "100vh" }}
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}

