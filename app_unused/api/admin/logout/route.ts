// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { audit, getIpFromHeaders, getUaFromHeaders } from "../../../lib/adminSecurity";

export async function POST(req: Request) {
  const ip = getIpFromHeaders(req.headers);
  const ua = getUaFromHeaders(req.headers);

  await audit({
    action: "admin_logout",
    ip,
    ua,
    note: "Logout",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
