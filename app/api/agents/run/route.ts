import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getCurrentUserId } from "../../lib/demoAuth";

export const runtime = "nodejs";

const AgentResponseSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function runFilesKey(userId: string, runId: string) {
  return `runfiles:${userId}:${runId}`;
}

export async function POST(req: Request) {
  try {
    // ✅ IMPORTANT: Import KV helpers ONLY at runtime (inside POST)
    const { kvJsonSet, kvNowISO } = await import("../../lib/kv");

    const userId = getCurrentUserId();
    const body = await req.json();

    const prompt = String(body.prompt || "").trim();
    const projectId = String(body.projectId || "").trim();

    if (!prompt || !projectId) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId or prompt" },
        { status: 400 }
      );
    }

    const runId = `run_${randomUUID().replace(/-/g, "")}`;
    const createdAt = kvNowISO();

    // Save run metadata
    await kvJsonSet(runKey(userId, runId), {
      id: runId,
      projectId,
      status: "running",
      createdAt,
      prompt,
    });

    // ✅ Only read env INSIDE POST
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set in Vercel env vars");

    // ✅ Import OpenAI ONLY at runtime
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return ONLY JSON like: { files: [{ path, content }] }. All paths MUST start with app/generated/.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = AgentResponseSchema.parse(JSON.parse(text));

    // Save generated files
    await kvJsonSet(runFilesKey(userId, runId), parsed.files);

    // Mark run complete
    await kvJsonSet(runKey(userId, runId), {
      id: runId,
      projectId,
      status: "completed",
      createdAt,
      completedAt: kvNowISO(),
      fileCount: parsed.files.length,
    });

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
