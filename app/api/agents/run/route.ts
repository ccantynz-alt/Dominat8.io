// app/api/agents/run/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = "agents-run-v7-CONTEXT_EDIT";

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

function projectFilesKey(userId: string, projectId: string) {
  return "projectfiles:" + userId + ":" + projectId;
}

function hasPrefix(value: unknown, prefix: string) {
  if (typeof value !== "string") return false;
  return value.slice(0, prefix.length) === prefix;
}

function userIdOrDemo(getCurrentUserId: any) {
  return (typeof getCurrentUserId === "function" && getCurrentUserId()) || "demo";
}

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

// Keep prompts small so we don’t blow token limits
function buildContextSnippet(filesMap: Record<string, string>) {
  const entries = Object.entries(filesMap || {});
  if (entries.length === 0) return { snippet: "", count: 0, included: 0 };

  // Sort by path for stability
  entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));

  const MAX_FILES = 20;
  const MAX_TOTAL_CHARS = 12000;

  let included = 0;
  let total = 0;
  let out = "CURRENT PROJECT FILES (path -> content):\n";

  for (const [path, content] of entries) {
    if (included >= MAX_FILES) break;
    if (typeof path !== "string" || typeof content !== "string") continue;

    const block =
      "\n---\nPATH: " +
      path +
      "\nCONTENT:\n" +
      content +
      "\n---\n";

    if (total + block.length > MAX_TOTAL_CHARS) break;

    out += block;
    total += block.length;
    included += 1;
  }

  out +=
    "\nNOTE: You may not see every file if the project is large. Only edit what you need.\n";

  return { snippet: out, count: entries.length, included };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: VERSION,
    message:
      "Agent endpoint is online. POST JSON { projectId, prompt }. Now includes project context for edits.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const parsedReq = RunRequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        {
          ok: false,
          version: VERSION,
          error: "Invalid request body",
          issues: parsedReq.error.issues,
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { ok: false, version: VERSION, error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
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

    // Load current project files (context)
    let contextInfo = { total: 0, included: 0 };
    let contextSnippet = "";
    try {
      const filesMap: Record<string, string> =
        (await kvJsonGet(projectFilesKey(userId, parsedReq.data.projectId))) || {};
      const built = buildContextSnippet(filesMap);
      contextSnippet = built.snippet;
      contextInfo = { total: built.count, included: built.included };
    } catch {
      // If context load fails, we still run the agent without context (don’t block)
      contextSnippet = "";
      contextInfo = { total: 0, included: 0 };
    }

    const client = new OpenAI({ apiKey });

    // System rules: output must be JSON with files array
    // and files must stay under app/generated/
    const system = [
      "You are a code-editing agent for a Next.js App Router project.",
      'Return JSON ONLY in this exact shape: {"files":[{"path":"app/generated/...","content":"..."}]}',
      "Rules:",
      "- ALWAYS output valid JSON only. No markdown.",
      '- Every file path MUST start with "app/generated/".',
      "- If editing an existing file, return the FULL updated content for that file.",
      "- Keep changes minimal and consistent with existing style.",
    ].join("\n");

    // User message: includes goal + existing files context
    const userMsgParts: string[] = [];
    userMsgParts.push("GOAL:\n" + parsedReq.data.prompt);

    if (contextSnippet) {
      userMsgParts.push("\n" + contextSnippet);
      userMsgParts.push(
        "\nINSTRUCTION:\nUpdate or create files under app/generated/ to accomplish the goal. " +
          "If app/generated/page.tsx exists above, edit it (don’t create a totally different page)."
      );
    } else {
      userMsgParts.push(
        "\nNOTE:\nNo existing project context was provided. Create the necessary files under app/generated/."
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsgParts.join("\n") },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeJsonParse(raw);

    const filesRaw = Array.isArray(parsed?.files) ? parsed.files : [];
    const cleaned = filesRaw
      .filter((f: any) => f && typeof f === "object")
      .map((f: any) => ({
        path: typeof f.path === "string" ? f.path : "",
        content: typeof f.content === "string" ? f.content : "",
      }))
      .filter((f: any) => hasPrefix(f.path, "app/generated/") && f.content.length > 0);

    if (cleaned.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          version: VERSION,
          error: "Agent returned no valid files",
          contextInfo,
          raw: parsed || raw,
        },
        { status: 400 }
      );
    }

    const runId = uid("run");
    const now = kvNowISO();

    await kvJsonSet(runKey(userId, runId), {
      runId,
      projectId: parsedReq.data.projectId,
      prompt: parsedReq.data.prompt,
      createdAt: now,
      contextInfo,
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

    return NextResponse.json({
      ok: true,
      version: VERSION,
      runId,
      filesCount: cleaned.length,
      contextInfo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, version: VERSION, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
