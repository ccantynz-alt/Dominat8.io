import { NextResponse } from "next/server";
import OpenAI from "openai";
import { storeGet, storeSet } from "../../../../../../lib/store";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: "queued" | "running" | "complete" | "failed";
  createdAt: string;
  updatedAt?: string;
  output?: {
    summary?: string;
    files?: { path: string; content: string }[];
  };
};

const RUN_KEY = (id: string) => `run:${id}`;

function nowISO() {
  return new Date().toISOString();
}

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { runId, projectId } = params;

  const run = await storeGet<Run>(RUN_KEY(runId));
  if (!run) return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  if (run.projectId !== projectId) {
    return NextResponse.json({ ok: false, error: "Run/project mismatch" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };

      // Immediately tell the client we're alive
      send("status", { status: "running" });

      // Persist status in KV
      await storeSet(RUN_KEY(runId), { ...run, status: "running", updatedAt: nowISO() });

      let fullText = "";

      try {
        const completionStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          stream: true,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content:
                "You are an expert SaaS website generator. Always respond as strict JSON, no markdown, no extra text.",
            },
            {
              role: "user",
              content: `
Generate:
1) A short summary of what you built
2) A Next.js page component at app/generated/page.tsx

Prompt:
${run.prompt}

Return STRICT JSON ONLY with this shape:
{
  "summary": "...",
  "files": [
    { "path": "app/generated/page.tsx", "content": "..." }
  ]
}
              `.trim(),
            },
          ],
        });

        for await (const chunk of completionStream) {
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (!delta) continue;

          fullText += delta;

          // Stream the live tokens to the client
          send("delta", { text: delta });
        }

        // Parse and save the final JSON output
        let parsed: any = null;
        try {
          parsed = JSON.parse(fullText);
        } catch {
          // If the model ever drifts, fail gracefully and show the raw text
          throw new Error("AI returned non-JSON output. (We can harden this next.)");
        }

        const completed: Run = {
          ...run,
          status: "complete",
          updatedAt: nowISO(),
          output: {
            summary: parsed.summary,
            files: parsed.files,
          },
        };

        await storeSet(RUN_KEY(runId), completed);

        send("done", { ok: true, runId });
        controller.close();
      } catch (err: any) {
        await storeSet(RUN_KEY(runId), { ...run, status: "failed", updatedAt: nowISO() });

        send("error", { ok: false, message: err?.message || "Streaming run failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
