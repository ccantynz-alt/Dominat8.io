// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../../lib/kv";
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

  await kvJsonSet(runKey(runId), run);

  const idxKey = projectRunsIndexKey(projectId);
  const idx = (await kvJsonGet<string[]>(idxKey)) ?? [];
  idx.unshift(runId);
  await kvJsonSet(idxKey, idx);

  try {
    await appendLog(runId, "info", "Run created. Starting generation…");
    run.status = "running";
    run.updatedAt = await kvNowISO();
    await kvJsonSet(runKey(runId), run);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY in Vercel env vars.");

    const client = new OpenAI({ apiKey });

    await appendLog(runId, "info", "Calling ChatGPT to generate files…");

    const system = [
      "You are a senior full-stack engineer.",
      "Return ONLY valid JSON. No markdown. No commentary.",
      "Output MUST be a JSON array of {path: string, content: string}.",
      "Paths are relative like 'app/templates/page.tsx'.",
      "Keep changes minimal and compile-safe for Next.js App Router + TypeScript.",
      "Do not delete existing files. Only create new files under 'app/generated/'.",
    ].join(" ");

    const user = [
      "Goal: AI automated website builder platform.",
      `ProjectId: ${projectId}`,
      "Task: Generate a small useful feature as files under app/generated/.",
      `Prompt: ${prompt}`,
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
      if (!Array.isArray(files)) throw new Error("Not an array");
      for (const f of files) {
        if (!f?.path || typeof f.path !== "string") throw new Error("Bad path");
        if (typeof f.content !== "string") throw new Error("Bad content");
      }
    } catch {
      await appendLog(runId, "error", "Model output was not valid JSON. Raw output logged:");
      await appendLog(runId, "error", text.slice(0, 4000));
      throw new Error("Generation failed (invalid JSON).");
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
