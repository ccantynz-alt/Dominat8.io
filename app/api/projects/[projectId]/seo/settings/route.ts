import { NextResponse } from "next/server";
import { getSeoSettings, setSeoSettings } from "@/app/lib/seoSettingsKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const settings = await getSeoSettings(params.projectId);
  return NextResponse.json({ ok: true, settings });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const body = await req.json();
  const indexing = body?.indexing;

  if (indexing !== "on" && indexing !== "off") {
    return NextResponse.json(
      { ok: false, error: "indexing must be 'on' or 'off'" },
      { status: 400 }
    );
  }

  const settings = await setSeoSettings(params.projectId, { indexing });
  return NextResponse.json({ ok: true, settings });
}
