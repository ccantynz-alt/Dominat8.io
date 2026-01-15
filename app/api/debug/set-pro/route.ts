import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

<<<<<<< HEAD
<<<<<<< HEAD
export async function POST(req: Request) {
=======
async function handle(req: Request) {
>>>>>>> 8149524 (fix: repair seo agent route syntax)
=======
export async function POST(req: Request) {
>>>>>>> a51c1da (fix: ensure set-pro debug route supports POST)
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

<<<<<<< HEAD
  return NextResponse.json({
    ok: true,
    userId,
    plan: "pro",
    message: "User upgraded to Pro (debug)",
  });
}

<<<<<<< HEAD
// Optional: if someone visits it in a browser, return a helpful message
export async function GET() {
=======
export async function POST(req: Request) {
  return handle(req);
}

export async function GET() {
  // Helpful response instead of a blank 405
>>>>>>> 8149524 (fix: repair seo agent route syntax)
=======
  return NextResponse.json({ ok: true, userId, plan: "pro" });
}

export async function GET() {
>>>>>>> a51c1da (fix: ensure set-pro debug route supports POST)
  return NextResponse.json(
    { ok: false, error: "USE_POST", hint: "Send POST with JSON { token }" },
    { status: 405 }
  );
}
