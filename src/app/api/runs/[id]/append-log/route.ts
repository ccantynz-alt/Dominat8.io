import { NextResponse } from "next/server";
import { appendRunLog } from "../../../../../lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const line = (body.line as string) ?? "";

  if (!line.trim()) {
    return NextResponse.json({ ok: false, error: "Missing line" }, { status: 400 });
  }

  await appendRunLog(params.id, line);
  return NextResponse.json({ ok: true });
}
