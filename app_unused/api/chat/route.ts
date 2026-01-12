import { NextRequest, NextResponse } from "next/server";

// Never crash at import-time during build:
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json().catch(() => ({ } as any));
    const message = typeof body?.message === "string" ? body.message : "";

    // Validate env INSIDE the handler (never at top-level)
    const openaiKey = process.env.OPENAI_API_KEY;

    // If not configured yet, return a safe response (keeps build green)
    if (!openaiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "OPENAI_API_KEY is not set. Add it to .env.local (Codespaces) and Vercel env vars.",
        },
        { status: 500 }
      );
    }

    // Stub response for now (replace with real OpenAI call later)
    return NextResponse.json( {
      ok: true,
      reply: `Stub reply received: ${message || "(no message)"}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST /api/chat" },
    { status: 405 }
  );
}
