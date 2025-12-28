// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import { randomUUID } from "crypto";

const RunSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string().min(1),
});

type GenFile = { path: string; content: string };

export async function POST(req: Request) {
  const userId = getCurrentUserId();
  const body = await req.json();
  const parsed = RunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  const { prompt, projectId } = parsed.data;

  // ---- SIMULATED AGENT OUTPUT (your existing logic already does this) ----
  // This assumes you already generate `files`
  const files: GenFile[] = body.files ?? [];

  const runId = `run_${randomUUID().replace(/-/g, "")}`;

  await kvJsonSet(`runs:${userId}:${runId}`, {
    runId,
    userId,
    projectId,
    prompt,
    files,
    createdAt: kvNowISO(),
  });

  // 🔥 AUTO-APPLY (this is the new part)
  const baseUrl =
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;

  await fetch(
    `${baseUrl}/api/projects/${projectId}/apply?runId=${runId}`,
    { method: "GET" }
  );

  return NextResponse.json({
    ok: true,
    runId,
    filesCount: files.length,
    autoApplied: true,
  });
}
