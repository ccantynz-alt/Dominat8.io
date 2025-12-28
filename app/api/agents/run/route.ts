// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = "agents-run-v6-RUN_INDEX";

const RunRequestSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1),
});

function uid(prefix = "") {
  const rnd = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return prefix ? prefix + "_" + ts + rnd : ts + rnd;
}

function runKey(userId: string, runId: string) {
  return "runs:" + userId + ":" + runId;
}

function runsIndexKey(userId: string) {
  return "runs:index:" + userId;
}

function hasPrefix(value: unknown, prefix: string) {
  if (typeof value !== "string") return false;
  return value.slice(0, prefix.length) === prefix;
}

function userIdOrDemo(getCurrentUserId: any) {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: VERSION,
    message: "Agent endpoint is online. POST JSON { projectId, prompt }",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const parsedReq = RunRequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        { ok: false, version: VERSION, error: "Invalid request body", issues: parsedReq.error.issues },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ ok: false, version: VERSION, error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const [{ default: OpenAI }, kvMod, authMod] = await Promise.all([
      import("openai"),
      import("../../../lib/kv"),
      import("../../../lib/demoAuth"),
    ]);

    const kvJsonGet = (kvMod as any).kvJsonGet;
    const kvJsonSet = (kvMod as any).kvJsonSet;
    const kvNowISO = (kvMod as any).kvNowISO;
    const getCurrentUserId = (authMod as any).getCurrentUserId;

    const userId = userIdOrDemo(getCurrentUserId);

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'Return JSON ONLY: {"files":[{"path":"app/generated/...","content":"..."}]}' },
        { role: "user", content: parsedReq.data.prompt },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, version: VERSION, error: "Model returned invalid JSON", raw }, { status: 500 });
    }

    const filesRaw = Array.isArray(parsed?.files) ? parsed.files : [];
    const cleaned = filesRaw
      .filter((f: any) => f && typeof f === "object")
      .map((f: any) => ({
        path: typeof f.path === "string" ? f.path : "",
        content: typeof f.content === "string" ? f.content : "",
      }))
      .filter((f: any) => hasPrefix(f.path, "app/generated/") && f.content.length > 0);

    if (cleaned.length === 0) {
      return NextResponse.json({ ok: false, version: VERSION, error: "Agent returned no valid files", raw: parsed }, { status: 400 });
    }

    const runId = uid("run");
    const now = kvNowISO();

    await kvJsonSet(runKey(userId, runId), {
      runId,
      projectId: parsedReq.data.projectId,
      prompt: parsedReq.data.prompt,
      createdAt: now,
      files: cleaned,
    });

    // Update runs index (latest first), keep 25
    const idxKey = runsIndexKey(userId);
    const idx = (await kvJsonGet(idxKey)) || [];
    const next = Array.isArray(idx) ? idx : [];
    next.unshift(runId);
    const seen: Record<string, boolean> = {};
    const deduped: string[] = [];
    for (const id of next) {
      if (typeof id === "string" && !seen[id]) {
        seen[id] = true;
        deduped.push(id);
      }
      if (deduped.length >= 25) break;
    }
    await kvJsonSet(idxKey, deduped);

    return NextResponse.json({ ok: true, version: VERSION, runId, filesCount: cleaned.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, version: VERSION, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
