import { NextResponse } from "next/server";
import { dequeueRun, appendRunLog, updateRunStatus, getRun, enqueueRun } from "../../../lib/store";
import { nowIso } from "../../../lib/time";
import { kv } from "../../../lib/kv";

type AgentResult = {
  summary?: string;
  logLines?: string[];
  nextActions?: Array<{
    type: "import_repo" | "trigger_deploy" | "create_run" | "note";
    title: string;
    payload?: Record<string, any>;
  }>;
  memoryPatch?: {
    notesToAdd?: string[];
    set?: Record<string, any>;
  };
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function pickProjectId(run: any): string {
  return run?.input?.projectId || run?.input?.repoFullName || run?.input?.repo || "default";
}

async function getProjectMemory(projectId: string): Promise<any> {
  const key = `memory:${projectId}`;
  const v = await kv.get(key);
  return v ?? { projectId, notes: [], updatedAt: nowIso() };
}

async function saveProjectMemory(projectId: string, memory: any) {
  const key = `memory:${projectId}`;
  await kv.set(key, { ...memory, projectId, updatedAt: nowIso() });
}

async function callAgentLLM(args: { run: any; memory: any }): Promise<AgentResult & { rawText: string }> {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  const { run, memory } = args;

  const system = `
You are the job-runner brain for an AI agent platform.
Output MUST be valid JSON only (no markdown, no backticks).

Return JSON shape:
{
  "summary": string,
  "logLines": string[],
  "nextActions": [
    { "type": "import_repo"|"trigger_deploy"|"create_run"|"note", "title": string, "payload": object? }
  ],
  "memoryPatch": { "notesToAdd": string[], "set": object }
}
`.trim();

  const user = `
RUN:
${JSON.stringify(run, null, 2)}

MEMORY:
${JSON.stringify(memory, null, 2)}

Decide what to do for run kind "${run.kind}".
Return JSON only.
`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const rawText: string = data?.choices?.[0]?.message?.content ?? "";

  const parsed = safeJsonParse<AgentResult>(rawText);
  if (!parsed) return { rawText };

  return { ...parsed, rawText };
}

export async function GET() {
  const startedAt = nowIso();
  const processed: string[] = [];
  const MAX = 2;

  for (let i = 0; i < MAX; i++) {
    const id = await dequeueRun();
    if (!id) break;

    processed.push(id);

    const run = await getRun(id);
    if (!run) continue;

    const projectId = pickProjectId(run);

    const attempt = Number(run?.input?.attempt ?? 1);
    const MAX_ATTEMPTS = 2;

    await updateRunStatus(id, "running", { input: { ...(run.input ?? {}), attempt } });
    await appendRunLog(id, `▶️ Started run (${run.kind}) "${run.title}" [attempt ${attempt}/${MAX_ATTEMPTS}]`);
    await appendRunLog(id, `📌 Project: ${projectId}`);

    try {
      const memory = await getProjectMemory(projectId);

      await appendRunLog(id, "🧠 Calling agent brain…");
      const result = await callAgentLLM({ run, memory });

      if (result.logLines && Array.isArray(result.logLines)) {
        for (const line of result.logLines.slice(0, 30)) {
          await appendRunLog(id, `• ${String(line)}`);
        }
      } else {
        await appendRunLog(id, "• (No logLines returned — raw model output below)");
        await appendRunLog(id, result.rawText.slice(0, 1500));
      }

      if (result.memoryPatch) {
        const nextMemory = { ...(memory ?? {}) };

        if (Array.isArray(result.memoryPatch.notesToAdd) && result.memoryPatch.notesToAdd.length) {
          const existing = Array.isArray(nextMemory.notes) ? nextMemory.notes : [];
          nextMemory.notes = [...existing, ...result.memoryPatch.notesToAdd.map(String)].slice(-200);
        }

        if (result.memoryPatch.set && typeof result.memoryPatch.set === "object") {
          nextMemory.state = { ...(nextMemory.state ?? {}), ...result.memoryPatch.set };
        }

        await saveProjectMemory(projectId, nextMemory);
        await appendRunLog(id, "💾 Memory updated.");
      }

      const output = {
        summary: result.summary ?? "(no summary)",
        nextActions: result.nextActions ?? [],
        projectId,
        finishedAt: nowIso()
      };

      await updateRunStatus(id, "succeeded", { output });
      await appendRunLog(id, "✅ Run succeeded.");
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error";
      await appendRunLog(id, `❌ Error: ${msg}`);

      if (attempt < MAX_ATTEMPTS) {
        const nextAttempt = attempt + 1;
        await appendRunLog(id, `🔁 Re-queueing for retry (attempt ${nextAttempt}/${MAX_ATTEMPTS})…`);
        await updateRunStatus(id, "queued", {
          input: { ...(run.input ?? {}), attempt: nextAttempt },
          error: msg
        });
        await enqueueRun(id);
      } else {
        await updateRunStatus(id, "failed", { error: msg });
        await appendRunLog(id, "🛑 Run failed (max attempts reached).");
      }
    }
  }

  return NextResponse.json({ ok: true, startedAt, processedCount: processed.length, processed });
}
