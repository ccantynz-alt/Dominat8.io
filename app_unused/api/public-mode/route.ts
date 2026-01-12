// app/api/public-mode/route.ts
import { NextResponse } from "next/server";
import { getPublicMode, setPublicMode } from "../../lib/publicMode";
import { isAdmin } from "../../lib/isAdmin";

export async function GET() {
  const mode = await getPublicMode();
  return NextResponse.json({ ok: true, mode });
}

export async function POST(req: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const mode = body?.mode === "off" ? "off" : "on";
  await setPublicMode(mode);

  return NextResponse.json({ ok: true, mode });
}
