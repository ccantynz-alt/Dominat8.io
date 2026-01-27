import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function nowIso() {
  return new Date().toISOString();
}

/**
 * Tolerant text extraction across Responses API shapes.
 * Returns "" if nothing usable is found.
 */
function extractAnyText(raw: any): string {
  if (!raw) return "";

  const out = (raw as any).output;
  if (Array.isArray(out)) {
    const chunks: string[] = [];
    for (const item of out) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          const t = c?.text;
          if (typeof t === "string" && t.trim()) chunks.push(t);
        }
      }
      if (typeof item?.text === "string" && item.text.trim()) chunks.push(item.text);
    }
    if (chunks.length) return chunks.join("\n\n");
  }

  if (typeof (raw as any).text === "string") return (raw as any).text;
  if (typeof (raw as any).output_text === "string") return (raw as any).output_text;
  if (typeof raw === "string") return raw;

  return "";
}

function extractPatchScript(text: string): { script: string; mode: string } | null {
  const t = (text || "").trim();
  if (!t) return null;

  // 1) Prefer explicit PowerShell fences
  const psFence = /```(?:powershell|pwsh|ps1)\s*([\s\S]*?)```/gi;
  const psMatches: string[] = [];
  for (let m; (m = psFence.exec(t)); ) {
    const body = (m[1] || "").trim();
    if (body) psMatches.push(body);
  }
  if (psMatches.length) {
    psMatches.sort((a,b) => b.length - a.length);
    return { script: psMatches[0], mode: "powershell_fence" };
  }

  // 2) Any fenced code (pick the largest)
  const anyFence = /```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/g;
  const anyMatches: string[] = [];
  for (let m; (m = anyFence.exec(t)); ) {
    const body = (m[1] || "").trim();
    if (body) anyMatches.push(body);
  }
  if (anyMatches.length) {
    anyMatches.sort((a,b) => b.length - a.length);
    return { script: anyMatches[0], mode: "any_fence" };
  }

  // 3) Fallback: store plain text as PowerShell comment block (SAFE)
  const header = [
    'Set-StrictMode -Version Latest',
    '$ErrorActionPreference = "Stop"',
    '',
    'Write-Host "NOTE: Fallback patch saved (no fenced code block found). Review before running."',
    ''
  ].join("\r\n");

  const commented = t.split(/\r?\n/).map(line => "# " + line).join("\r\n");
  const script = header + "\r\n" + commented + "\r\n";

  return { script, mode: "fallback_text" };
}

function minimalPatch(runId: string, agentId: string) {
  return [
    'Set-StrictMode -Version Latest',
    '$ErrorActionPreference = "Stop"',
    '',
    `Write-Host "NOTE: Empty output from agent. Creating diagnostic file."`,
    `Set-Content -Path ".\\AGENT_EMPTY_${runId}.txt" -Value "EMPTY_OUTPUT agentId=${agentId} runId=${runId}" -Encoding UTF8 -NoNewline`,
    ''
  ].join("\r\n");
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch {}

  const projectId = String(body?.projectId || "demo");
  const agentId   = String(body?.agentId || body?.agent || "02_creative_director");

  const modelName = String(body?.model || process.env.OPENAI_MODEL || "gpt-5");
  const reasoningEffort = String(body?.reasoningEffort || "low");
  const maxOutputTokens = Number(body?.maxOutputTokens || 900);

  const prompt = String(body?.prompt || body?.instruction || "").trim();
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "MISSING_PROMPT" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const raw = await openai.responses.create({
    model: modelName as any,
    reasoning: { effort: reasoningEffort as any },
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
`Return ONLY a single fenced PowerShell code block.
No commentary. No extra text.

TASK:
${prompt}
`
          }
        ]
      }
    ],
  });

  const runId = String((raw as any).id || `run_${Date.now().toString(36)}`);
  const status = String((raw as any).status || "unknown");

  // 1) Try normal extraction
  const outputText = extractAnyText(raw);
  let extracted = extractPatchScript(outputText);

  // 2) If empty outputText, fallback to raw JSON as text input (so we ALWAYS save something)
  let mode = extracted?.mode || "";
  let script = extracted?.script || "";

  if (!script) {
    // try raw json fallback
    let rawText = "";
    try { rawText = JSON.stringify(raw, null, 2); } catch { rawText = String(raw); }

    // cap rawText to keep KV reasonable
    if (rawText.length > 12000) rawText = rawText.slice(0, 12000) + "\n# ...TRUNCATED...\n";

    const rawFallback = extractPatchScript(rawText);
    if (rawFallback?.script) {
      mode = "fallback_raw";
      script = rawFallback.script;
    } else {
      mode = "empty_minimal";
      script = minimalPatch(runId, agentId);
    }
  }

  const patchObj = {
    runId,
    projectId,
    agentId,
    createdAt: nowIso(),
    status,
    mode,
    script,
  };

  const patchLatest = `agentPatch:project:${projectId}:latest`;
  const patchById   = `agentPatch:project:${projectId}:${runId}`;

  await kv.set(patchLatest, patchObj);
  await kv.set(patchById, patchObj);

  const runObj = {
    runId,
    projectId,
    agentId,
    createdAt: nowIso(),
    status,
    model: { name: modelName, reasoningEffort, maxOutputTokens },
    patchSaved: true,
    patchMode: mode,
    patchChars: script.length,
    raw,
  };

  await kv.set(`agentRun:project:${projectId}:${runId}`, runObj);
  await kv.set(`agentRun:project:${projectId}:latest`, runObj);

  return NextResponse.json({
    ok: true,
    projectId,
    agentId,
    runId,
    status,
    patchSaved: true,
    patchMode: mode,
    patchChars: script.length,
    patchKeys: { patchLatest, patchById },
  });
}
