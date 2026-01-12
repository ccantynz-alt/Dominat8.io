import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    // ─────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, runId } = params;

    // ─────────────────────────────────────────────
    // LOAD RUN
    // ─────────────────────────────────────────────
    const runKey = `run:${runId}`;
    const run = await kv.get<any>(runKey);

    if (!run) {
      return NextResponse.json(
        { ok: false, error: "Run not found" },
        { status: 404 }
      );
    }

    const prompt = run.prompt;
    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: "Run has no prompt" },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // GENERATE HTML
    // ─────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional web developer. Return ONLY valid HTML. No markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const html =
      completion.choices?.[0]?.message?.content?.trim() ?? "";

    if (!html) {
      return NextResponse.json(
        { ok: false, error: "AI returned empty HTML" },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // SAVE HTML (FIXED — PROJECT + GLOBAL)
    // ─────────────────────────────────────────────

    // Project-specific HTML (PRIMARY)
    const projectHtmlKey = `generated:project:${projectId}:latest`;
    await kv.set(projectHtmlKey, html);

    // Global fallback (KEEP EXISTING BEHAVIOR)
    await kv.set("generated:latest", html);

    // ─────────────────────────────────────────────
    // UPDATE RUN STATUS
    // ─────────────────────────────────────────────
    await kv.set(runKey, {
      ...run,
      status: "complete",
      completedAt: new Date().toISOString(),
      output: `Saved generated website HTML`,
    });

    // ─────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      projectId,
      runId,
      saved: [
        projectHtmlKey,
        "generated:latest",
      ],
    });
  } catch (err: any) {
    console.error("EXECUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
