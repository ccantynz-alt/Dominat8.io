import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function handle(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = body?.token;

  if (!token || token !== process.env.DEBUG_PRO_TOKEN) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  await kv.set(`user:${userId}:plan`, "pro");

  return NextResponse.json({
    ok: true,
    userId,
    plan: "pro",
    message: "User upgraded to Pro (debug)",
  });
}

// Allow POST (what the browser call uses)
export async function POST(req: Request) {
  return handle(req);
}

// Also allow GET so it can never 405 again (optional)
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "USE_POST", hint: "Send POST with JSON { token }" },
    { status: 405 }
  );
}
