import { NextRequest, NextResponse } from "next/server";

// Never crash at import-time during build:
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json().catch(() => ({ } as any));
    
    // Stub generation response (build-safe)
    return NextResponse.json({
      ok: true,
      data: {
        message: "Generate stub response",
        input: body || null
      }
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
    { ok: false, error: "Use POST /api/generate" },
    { status: 405 }
  );
}
