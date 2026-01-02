// app/api/projects/[projectId]/program-pages/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/isAdmin";
import { getProgramPages } from "@/app/lib/programPagesKV";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const pages = await getProgramPages(params.projectId);
  return NextResponse.json({ ok: true, pages, count: pages.length });
}
