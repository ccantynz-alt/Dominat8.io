// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

// If you already have these helpers in your project, keep these imports.
// If your project uses different paths, adjust them to match your repo.
import { kvJsonGet, kvJsonSet, kvNowISO } from "../../lib/kv";

// If you use a demo auth helper, keep it. If not, we’ll fall back safely.
import { getCurrentUserId } from "../../lib/demoAuth";

import OpenAI from "openai";

export const runtime = "nodejs";

// ---------- Schemas (keeps the app from crashing on bad data) ----------
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

// ---------- Small helpers ----------
function runKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}`;
}

function uid(prefix = "") {
  const rnd = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return prefix ? `${prefix}_${ts}${rnd}` : `${ts}${rnd}`;
}

// ---------- GET: status (safe to open in browser) ----------
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

// ---------- POST: run agent ----------
export async function POST(req: Request) {
  try {
    // 1) Parse incoming JSON safely
    const body = await req.json().catch(() => null);

    const parsedReq = RunRequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body. Must be JSON: { projectId, prompt }",
          issues: parsedReq.error.issues,
        },
        { status: 400 }
      );
    }

    const { projectId, prompt } = parsedReq.data;

    // 2) Validate env (so errors are readable)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY in Vercel env vars" },
        { status: 500 }
      );
    }

    // 3) Create OpenAI client
    const client = new OpenAI({ apiKey });

    // 4) Ask model for STRICT JSON ONLY
    const system = `
You are a codegen agent.
Return JSON ONLY. No markdown. No commentary.
The only valid response shape is:
{
  "files": [
    { "path": "app/generated/...", "content": "..." }
  ]
}
Rules:
- Every file.path MUST start with "app/generated/"
- content must be a string.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system.trim() },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    // 5) Parse model JSON safely
    let agentJson: unknown = null;
    try {
      agentJson = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          error: "Model did not return valid JSON (could not parse).",
          raw: text.slice(0, 2000),
        },
        { status: 500 }
      );
    }

    const parsedAgent = AgentResponseSchema.safeParse(agentJson);
    if (!parsedAgent.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Model returned JSON but not in the required shape.",
          issues: parsedAgent.error.issues,
          raw: agentJson,
        },
        { status: 500 }
      );
    }

    const files = parsedAgent.data.files;

    // 6) Enforce the app/generated/ prefix (and error clearly if wrong)
    for (const f of files) {
      if (typeof f.path !== "string" || !f.path.startsWith("app/generated/")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Invalid file.path. Every path must start with "app/generated/".',
            badFile: f,
          },
          { status: 400 }
        );
      }
      if (typeof f.content !== "string") {
  return NextResponse.json(
    { ok: false, error: "Invalid file.content (must be a string).", badFile: f },
    { status: 400 }
  );
}

