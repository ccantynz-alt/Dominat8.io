// app/api/admin/audit/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/isAdmin";
import { getAuditEvents } from "../../../lib/adminSecurity";

export async function GET(req: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || "50");
  const events = await getAuditEvents(limit);

  return NextResponse.json({ ok: true, events });
}
