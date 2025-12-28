import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";

export const runtime = "nodejs";

const AgentResponseSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
});

// ✅ If you open the endpoint in a browser, you will now see this JSON (no blank screen)
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Agent endpoint is online. Use POST with JSON { projectId, prompt }",
    example: {
      projectId: "proj_test",
      prompt: "Create app/generated/page.tsx with a hero headline and button",
    },
  });
}

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function runFilesKey(userId: string, runId: string) {
  return `runfiles:${userId}:${runId}`;
}

export async function POST(req: Request) {
  try {
    // ✅ Lazy-load inside POST so builds stay safe
    const { getCurrentUserId } = await import("../../../lib/demoAuth");
    const { kvJsonSet, kvNowISO } = await import("../../../lib/kv");

    const userId = getCurrentUserId();
    const body = await req.json().catch(() => ({} as any));

    const projectId = String(body.projectId || "").trim();
    const prompt = String(body.prompt || "").trim();

    if (!projectId || !prompt) {
      return NextResponse.json(
        { ok: false, error: "Missing projectId or prompt" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY in Vercel env vars" },
        { status: 500 }
      );
    }

    const runId = `run_${randomUUID().replace(/-/g, "")}`;
    const createdAt = kvNowISO();

    await kvJsonSet(runKey(userId, runId), {
      id: runId,
      projectId,
      status: "running",
      createdAt,
      prompt,
    });

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
            'Return ONLY JSON: { "files": [ { "path": "app/generated/...", "content": "..." } ] }. Paths MUST start with "app/generated/".',
        },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = AgentResponseSchema.parse(JSON.parse(text));

    await kvJsonSet(runFilesKey(userId, runId), parsed.files);

    await kvJsonSet(runKey(userId, runId), {
      id: runId,
      projectId,
      status: "completed",
      createdAt,
      completedAt: kvNowISO(),
      fileCount: parsed.files.length,
    });

    return NextResponse.json({
      ok: true,
      runId,
      fileCount: parsed.files.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
