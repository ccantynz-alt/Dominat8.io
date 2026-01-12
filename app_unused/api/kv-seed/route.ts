import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const id = "proj_kvseed_" + Date.now().toString(16);

  const project = {
    id,
    name: "KV Seed Project",
    templateId: "seed",
    templateName: "Seed",
    seedPrompt: "Seed prompt",
    createdAt: new Date().toISOString(),
  };

  // Write project
  await kv.set(`project:${id}`, JSON.stringify(project));

  // Add to index set
  await kv.sadd("projects:index", id);

  return NextResponse.json({
    ok: true,
    wrote: true,
    project,
  });
}
