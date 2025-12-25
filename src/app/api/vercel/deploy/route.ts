import { NextResponse } from "next/server";

export async function POST() {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return NextResponse.json(
      { ok: false, error: "Missing VERCEL_DEPLOY_HOOK_URL in environment variables" },
      { status: 400 }
    );
  }

  const res = await fetch(hook, { method: "POST" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: "Deploy hook failed", details: text },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
