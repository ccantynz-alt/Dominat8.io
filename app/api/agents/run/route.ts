// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { kv, kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
import { z } from "zod";
import { randomUUID } from "crypto";

const BodySchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1),
});

type RunStatus = "queued" | "running" | "failed" | "succeeded";

type RunRecord = {
  id: string;
  projectId: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

type RunLog = { ts: string; level: "info" | "error"; msg: string };

type GeneratedFile = { path: string; content: string };

function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

function runKey(runId: string) {
  return `runs:${runId}`;
}

function runLogsKey(runId: string) {
  return `runs:${runId}:logs`;
}

function runFilesKey(runId: string) {
  return `runs:${runId}:files`;
}

function projectRunsIndexKey(projectId: string) {
  return `projects:${projectId}:runs`;
}

async function appendLog(runId: string, level: RunLog["level"], msg: string) {
  const ts = await kvNowISO();
  const entry: RunLog = { ts, level, msg };
  const key = runLogsKey(runId);
  const logs = ((await kvJsonGet<RunLog[]>(key)) ?? []) as RunLog[];
  logs.push(entry);
  await kvJsonSet(key, logs);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const { projectId, prompt } = parsed.data;
  const now = await kvNowISO();
  const runId = uid("run");

  const run: RunRecord = {
    id: runId,
    projectId,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  // Create run + index
  await kvJsonSet(runKey(runId), run);
  const idxKey = projectRunsIndexKey(projectId);
  const idx = (await kvJsonGet<string[]>(idxKey)) ?? [];
  idx.unshift(runId);
  await kvJsonSet(idxKey, idx);

  // Start generation (synchronously for MVP)
  try {
    await appendLog(runId, "info", "Run created. Starting generation…");
    run.status = "running";
    run.updatedAt = await kvNowISO();
    await kvJsonSet(runKey(runId), run);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    const client = new OpenAI({ apiKey });

    await appendLog(runId, "info", "Calling ChatGPT to generate file tree JSON…");

    // We generate a VERY small, safe starter template as JSON: [{path, content}]
    // You will evolve the prompt + templates later.
    const system = [
      "You are a senior full-stack engineer.",
      "Return ONLY valid JSON. No markdown. No commentary.",
      "Your output must be a JSON array of objects: {path: string, content: string}.",
      "Paths must be relative, like 'app/page.tsx'.",
      "Generate a minimal Next.js App Router project feature for a website builder:",
      "- Home page",
      "- Dashboard page",
      "- Projects list UI calling /api/projects",
      "- Runs UI calling /api/agents/run and /api/runs endpoints",
      "Keep it small and compile-safe.",
    ].join(" ");

    const user = [
      "Project goal: AI automated website builder platform.",
      "Task: Generate a minimal feature addition consistent with the existing app.",
      `User prompt: ${prompt}`,
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
    let files: GeneratedFile[] = [];
    try {
      files = JSON.parse(text);
      if (!Array.isArray(files)) throw new Error("JSON is not an array");
      for (const f of files) {
        if (!f?.path || typeof f.path !== "string") throw new Error("Invalid file path");
        if (typeof f.content !== "string") throw new Error("Invalid file content");
      }
    } catch (e: any) {
      await appendLog(runId, "error", "Model output was not valid JSON. Storing raw output as a log.");
      await appendLog(runId, "error", text.slice(0, 4000));
      throw new Error("Generation failed: model did not return valid JSON.");
    }

    await kvJsonSet(runFilesKey(runId), files);
    await appendLog(runId, "info", `Generated ${files.length} files.`);
    await appendLog(runId, "info", "Run completed.");

    run.status = "succeeded";
    run.updatedAt = await kvNowISO();
    await kvJsonSet(runKey(runId), run);

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    await appendLog(runId, "error", err?.message ?? "Unknown error");
    const latest = (await kvJsonGet<RunRecord>(runKey(runId))) ?? run;
    latest.status = "failed";
    latest.error = err?.message ?? "Unknown error";
    latest.updatedAt = await kvNowISO();
    await kvJsonSet(runKey(runId), latest);

    return NextResponse.json({ ok: false, runId, error: latest.error }, { status: 500 });
  }
}
