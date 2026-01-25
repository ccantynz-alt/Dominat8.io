import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/marketingMachine/adminAuth";
import { bulkAction } from "@/lib/marketingMachine/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });

  const body = await req.json().catch(() => ({} as any));

  const action = String(body.action || "");
  if (!["approve","reject","schedule"].includes(action)) {
    return NextResponse.json({ ok: false, error: "action must be approve|reject|schedule" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.map((x: any) => String(x)) : [];
  if (!ids.length) return NextResponse.json({ ok: false, error: "ids is required" }, { status: 400 });

  const result = await bulkAction({
    action: action as any,
    ids,
    reason: body.reason ? String(body.reason) : undefined,
    scheduledForBase: body.scheduledForBase ? String(body.scheduledForBase) : undefined,
    spacingMins: body.spacingMins !== undefined ? Number(body.spacingMins) : undefined,
    jitterMaxMins: body.jitterMaxMins !== undefined ? Number(body.jitterMaxMins) : undefined,
    overrideCompliance: body.overrideCompliance === true,
  });

  return NextResponse.json({ ok: true, result });
}