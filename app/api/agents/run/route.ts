// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const RunSchema = z.object({
  prompt: z.string().min(1),
  projectId: z.string().min(1),
});

const GenFileSchema = z.object({
  path: z.string().min(1),
  content: z.string().min(1),
});

const GenFilesSchema = z.array(GenFileSchema).min(1);

type GenFile = z.infer<typeof GenFileSchema>;

type ProjectRecord = {
  projectId: string;
  userId: string;
  files: GenFile[];
  updatedAt: string;
};

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, "");
}

function mergeByPath(existing: GenFile[], incoming: GenFile[]) {
  const map = new Map<string, GenFile>();

  for (const f of existing) {
    const p = normalizePath(f.path);
    map.set(p, { path: p, content: f.content });
  }
  for (const f of incoming) {
    const p = normalizePath(f.path);
    map.set(p, { path: p, content: f.content });
  }

  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

export async function POST(req: Request) {
  const userId = getCurrentUserId();
  const body = await req.json();
  const parsed = RunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request. Expected { prompt, projectId }" },
      { status: 400 }
    );
  }

  const { prompt, projectId } = parsed.data;

  // Load existing project files for context
  const existingProject = await kvJsonGet<ProjectRecord>(projectKey(userId, projectId));
  const existingFiles = (existingProject?.files ?? []).map((f) => ({
    path: normalizePath(f.path),
    content: f.content,
  }));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = [
    "You are an AI website builder that outputs real Next.js App Router files.",
    'Return ONLY valid JSON with this exact shape: [{"path":"...","content":"..."}, ...].',
    "Do NOT wrap in markdown. Do NOT include explanations.",
    "Paths must be under app/generated/** and represent Next.js App Router pages.",
    "Use TSX and export default React components.",
    "If the user asks to modify an existing page, update that exact page file path.",
  ].join("\n");

  const user = [
    "PROJECT CONTEXT (existing files):",
    JSON.stringify(existingFiles, null, 2),
    "",
    "USER REQUEST:",
    prompt,
  ].join("\n");

  let files: GenFile[] = [];
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    const parsedJson = JSON.parse(text);
    const validated = GenFilesSchema.parse(parsedJson);
    files = validated.map((f) => ({
      path: normalizePath(f.path),
      content: f.content,
    }));
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Agent generation failed",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }

  const runId = `run_${randomUUID().replace(/-/g, "")}`;

  // Save run (temporary)
  await kvJsonSet(runKey(userId, runId), {
    ok: true,
    runId,
    userId,
    projectId,
    prompt,
    files,
    createdAt: kvNowISO(),
  });

  // ✅ AUTO-APPLY (NO HTTP): merge into project KV directly
  const beforeCount = existingFiles.length;
  const mergedFiles = mergeByPath(existingFiles, files);

  const nextProject: ProjectRecord = {
    projectId,
    userId,
    files: mergedFiles,
    updatedAt: kvNowISO(),
  };

  await kvJsonSet(projectKey(userId, projectId), nextProject);

  return NextResponse.json({
    ok: true,
    version: "agents-run-v9-openai+direct-auto-apply",
    runId,
    filesCount: files.length,
    autoApplied: true,
    apply: {
      beforeCount,
      incomingCount: files.length,
      afterCount: mergedFiles.length,
    },
  });
}
