import { NextResponse } from "next/server";
import { getRun, getRunLogs } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const run = await getRun(params.id);
  if (!run) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const logs = await getRunLogs(params.id, 300);
  return NextResponse.json({ ok: true, run, logs });
}
