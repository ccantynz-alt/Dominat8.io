import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RunsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { userId } = auth();
  if (!userId) return notFound();

  const { projectId } = params;

  const project = await kv.get<any>(`project:${projectId}`);
  if (!project || project.ownerId !== userId) return notFound();

  const runsKey = `project:${projectId}:runs`;
  const runIds = (await kv.lrange<string>(runsKey, 0, -1)) || [];

  const runs = await Promise.all(
    runIds.map(async (id) => ({
      id,
      data: await kv.get<any>(`run:${id}`),
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div
