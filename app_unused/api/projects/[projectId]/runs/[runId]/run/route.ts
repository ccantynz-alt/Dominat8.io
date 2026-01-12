import { NextResponse } from "next/server";
import OpenAI from "openai";
import { storeGet, storeSet } from "../../../../../../lib/store";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { runId, projectId } = params;

  const run = await storeGet<Run>(RUN_KEY(runId));
  if (!run) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }
  if (run.projectId !== projectId) {
    return NextResponse.json({ ok: false, error: "Run/project mismatch" }, { status: 400 });
  }

  // 1) mark running
  await storeSet(RUN_KEY(runId), {
    ...run,
    status: "running",
    updatedAt: nowISO(),
  });

  try {
    // 2) call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert SaaS website generator. Output clean, modern React/Next.js code.",
        },
        {
          role: "user",
          content: `
Generate:
1) A short summary of what you built
2) A Next.js page component at app/generated/page.tsx

Prompt:
${run.prompt}

Respond in JSON with this shape:
{
  "summary": "...",
  "files": [
    { "path": "app/generated/page.tsx", "content": "..." }
  ]
}
          `,
        },
      ],
      temperature: 0.4,
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

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

    return NextResponse.json({ ok: true, run: completed });
  } catch (err: any) {
    await storeSet(RUN_KEY(runId), {
      ...run,
      status: "failed",
      updatedAt: nowISO(),
    });

    return NextResponse.json(
      { ok: false, error: err?.message || "AI run failed" },
      { status: 500 }
    );
  }
}
