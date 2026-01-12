// app/api/admin/me/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/isAdmin";
import { audit, getIpFromHeaders, getUaFromHeaders } from "../../../lib/adminSecurity";

export async function GET(req: Request) {
  const admin = await isAdmin();

  const ip = getIpFromHeaders(req.headers);
  const ua = getUaFromHeaders(req.headers);

  await audit({
    action: "admin_me_check",
    ip,
    ua,
    note: admin ? "admin=true" : "admin=false",
  });

  return NextResponse.json({ ok: true, admin });
}
