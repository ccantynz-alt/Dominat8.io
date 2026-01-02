// app/api/admin/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.ADMIN_ACCESS_CODE;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Missing ADMIN_ACCESS_CODE env var" },
      { status: 500 }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const code = String(body?.code ?? "");
  if (code !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Session cookie
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
