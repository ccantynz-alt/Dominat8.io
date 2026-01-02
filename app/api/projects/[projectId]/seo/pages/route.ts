import { NextResponse } from "next/server";
import { getSeoPages } from "../../../../../lib/seoPagesKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const pages = await getSeoPages(params.projectId);
  return NextResponse.json({ ok: true, pages });
}
