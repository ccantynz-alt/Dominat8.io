export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  dequeueRun,
  appendRunLog,
  updateRunStatus,
  getRun,
  enqueueRun
} from "../../../lib/store";
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

/**
 * Safe JSON parse (never throws)
 */
function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Choose a stable project identifier
 */
function pickProjectId(run: any): string {
  return (
    run?.input?.projectId ||
    run?.input?.repoFullName ||
    run?.input?.repo ||
    "default"
  );
}

/**
 * Load project memory from KV
 */
async function getProjectMemory(projectId: string) {
  const key = `memory:${projectId}`;
  const memory = await kv.get(key);
  return memory ?? { projectId, notes: [], updatedAt: nowIso() };
}

/**
 * Save project memory
 */
async function saveProjectMemory(projectId: string, memory: any) {
  const key = `memory:${projectId}`;
  await kv.set(key, {
    ...memory,
    projectId,
    updatedAt: nowIso()
  });
}

/**
 * Call OpenAI as the agent brain
 */
async function callAgentLLM(run: any, memory: any): Promise<AgentResult & { rawText: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const systemPrompt = `
You are an autonomous job-runner AI for a software platform.

Rules:
- Output VALID JSON ONLY
- No markdown
- No backticks
- No explanations outside JSON

Required format:
{
  "summary": string,
  "logLines": string[],
  "nextActions": [
    { "type": "import_repo"|"trigger_deploy"|"create_run"|"note", "title": string, "payload": object? }
  ],
  "memoryPatch": { "notesToAdd": string[], "set": object }
}
`.trim();

  const userPrompt = `
RUN:
${JSON.stringify(run, null, 2)}

MEMORY:
${JSON.stringify(memory, null, 2)}

Determine the correct next step for run kind "${run.kind}".
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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content ?? "";

  const parsed = safeJsonParse<AgentResult>(rawText);
  if (!parsed) {
    return { rawText };
  }

  return { ...parsed, rawText };
}

/**
 * CRON ENTRYPOINT
 */
export async function GET() {
  const startedAt = nowIso();
  const processed: string[] = [];
  const MAX_RUNS = 2;

  for (let i = 0; i < MAX_RUNS; i++) {
    const runId = await dequeueRun();
    if (!runId) break;

    processed.push(runId);

    const run = await getRun(runId);
    if (!run) continue;

    const projectId = pickProjectId(run);
    const attempt = Number(run?.input?.attempt ?? 1);
    const MAX_ATTEMPTS = 2;

    await updateRunStatus(runId, "running", {
      input: { ...(run.input ?? {}), attempt }
    });

    await appendRunLog(runId, `▶️ Started run "${run.title}" (${run.kind})`);
    await appendRunLog(runId, `📌 Project: ${projectId}`);
    await appendRunLog(runId, `🔁 Attempt ${attempt}/${MAX_ATTEMPTS}`);

    try {
      const memory = await getProjectMemory(projectId);
      await appendRunLog(runId, "🧠 Thinking…");

      const result = await callAgentLLM(run, memory);

      if (Array.isArray(result.logLines)) {
        for (const line of result.logLines.slice(0, 30)) {
          await appendRunLog(runId, `• ${line}`);
        }
      } else {
        await appendRunLog(runId, result.rawText.slice(0, 1200));
      }

      if (result.memoryPatch) {
        const nextMemory = { ...(memory ?? {}) };

        if (Array.isArray(result.memoryPatch.notesToAdd)) {
          nextMemory.notes = [
            ...(nextMemory.notes ?? []),
            ...result.memoryPatch.notesToAdd
          ].slice(-200);
        }

        if (result.memoryPatch.set) {
          nextMemory.state = {
            ...(nextMemory.state ?? {}),
            ...result.memoryPatch.set
          };
        }

        await saveProjectMemory(projectId, nextMemory);
        await appendRunLog(runId, "💾 Memory updated");
      }

      await updateRunStatus(runId, "succeeded", {
        output: {
          summary: result.summary ?? "(no summary)",
          nextActions: result.nextActions ?? [],
          projectId,
          finishedAt: nowIso()
        }
      });

      await appendRunLog(runId, "✅ Run completed");
    } catch (err: any) {
      const message = err?.message ?? "Unknown error";
      await appendRunLog(runId, `❌ Error: ${message}`);

      if (attempt < MAX_ATTEMPTS) {
        await appendRunLog(runId, "🔁 Re-queueing for retry");
        await updateRunStatus(runId, "queued", {
          input: { ...(run.input ?? {}), attempt: attempt + 1 },
          error: message
        });
        await enqueueRun(runId);
      } else {
        await updateRunStatus(runId, "failed", { error: message });
        await appendRunLog(runId, "🛑 Run failed permanently");
      }
    }
  }

  return NextResponse.json({
    ok: true,
    startedAt,
    processedCount: processed.length,
    processed
  });
}
