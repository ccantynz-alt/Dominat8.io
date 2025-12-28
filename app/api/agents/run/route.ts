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

function projectKey(userId: string, projectId: string) {
  return `projects:${userId}:${projectId}`;
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, "");
}

function baseUrlFromEnv() {
  // VERCEL_URL is usually like "my-app.vercel.app" (no scheme)
  const v = process.env.VERCEL_URL;
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
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

  // Load existing project files for context (helps iterative editing)
  const existingProject = await kvJsonGet<ProjectRecord>(projectKey(userId, projectId));
  const existingFiles = (existingProject?.files ?? []).map((f) => ({
    path: normalizePath(f.path),
    content: f.content,
  }));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // We force the model to return STRICT JSON only (no markdown)
  const system = [
    "You are an AI website builder that outputs real Next.js App Router files.",
    "Return ONLY valid JSON with this exact shape: [{\"path\":\"...\",\"content\":\"...\"}, ...].",
    "Do NOT wrap in markdown. Do NOT include explanations.",
    "Paths must be under app/generated/** and represent Next.js App Router pages.",
    "Use TypeScript/TSX and export default React components.",
    "If the user asks to modify an existing page, update that page file path.",
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
    // Using responses API style via SDK: many installs support .responses.create
    // But to be safe with broad SDK versions, use chat.completions.
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    // Parse JSON strictly
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
        hint:
          "The model must return strict JSON only. Check server logs for the raw model output if needed.",
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }

  const runId = `run_${randomUUID().replace(/-/g, "")}`;

  await kvJsonSet(`runs:${userId}:${runId}`, {
    ok: true,
    runId,
    userId,
    projectId,
    prompt,
    files,
    createdAt: kvNowISO(),
  });

  // 🔥 AUTO-APPLY
  const baseUrl = baseUrlFromEnv();
  try {
    // If baseUrl exists, call absolute. Otherwise call relative (local/dev)
    const applyUrl = baseUrl
      ? `${baseUrl}/api/projects/${projectId}/apply?runId=${runId}`
      : `/api/projects/${projectId}/apply?runId=${runId}`;

    await fetch(applyUrl, { method: "GET" });
  } catch {
    // Even if auto-apply fails, still return the run so user can apply manually
  }

  return NextResponse.json({
    ok: true,
    version: "agents-run-v8-openai-json+auto-apply",
    runId,
    filesCount: files.length,
    autoApplied: true,
  });
}
