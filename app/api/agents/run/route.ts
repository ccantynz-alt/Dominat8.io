// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RunRequestSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1),
});

const AgentResponseSchema = z.object({
  files: z.array(
    z.object({
      path: z.string().min(1),
      content: z.string(),
    })
  ),
});

function uid(prefix = "") {
  const rnd = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return prefix ? `${prefix}_${ts}${rnd}` : `${ts}${rnd}`;
}

function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const parsedReq = RunRequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body", issues: parsedReq.error.issues },
        { status: 400 }
      );
    }

    const { projectId, prompt } = parsedReq.data;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // IMPORTANT: dynamic imports (prevents build-time evaluation crashes)
    const [{ default: OpenAI }, kvMod, authMod] = await Promise.all([
      import("openai"),
      import("../../../lib/kv"),
      import("../../../lib/demoAuth"),
    ]);

    const { kvJsonSet, kvNowISO } = kvMod as any;
    const { getCurrentUserId } = authMod as any;

    const client = new OpenAI({ apiKey });

    const system =
      'Return JSON only. Shape: {"files":[{"path":"app/generated/...","content":"..."}]}. ' +
      'Rules: every path must start with "app/generated/".';

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    let agentJson: unknown;

    try {
      agentJson = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Model did not return valid JSON", raw: text.slice(0, 2000) },
        { status: 500 }
      );
    }

    const parsedAgent = AgentResponseSchema.safeParse(agentJson);
    if (!parsedAgent.success) {
      return NextResponse.json(
        { ok: false, error: "Model JSON wrong shape", issues: parsedAgent.error.issues, raw: agentJson },
        { status: 500 }
      );
    }

    const files = parsedAgent.data.files;

    // SAFE enforcement (can never crash)
    for (const f of files) {
      if (typeof f?.path !== "string") {
        return NextResponse.json(
          { ok: false, error: "Invalid file.path (missing or not a string)", badFile: f },
          { status: 400 }
        );
      }
      if (!f.path.startsWith("app/generated/")) {
        return NextResponse.json(
          { ok: false, error: 'Invalid path (must start with "app/generated/")', badFile: f },
          { status: 400 }
        );
      }
      if (typeof f?.content !== "string") {
        return NextResponse.json(
          { ok: false, error: "Invalid file.content (must be a string).", badFile: f },
          { status: 400 }
        );
      }
    }

    const userId =
      (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";

    const runId = uid("run");
    const now = kvNowISO();

    await kvJsonSet(runKey(userId, runId), {
      runId,
      projectId,
      prompt,
      createdAt: now,
      files,
    });

    return NextResponse.json({ ok: true, runId, filesCount: files.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
