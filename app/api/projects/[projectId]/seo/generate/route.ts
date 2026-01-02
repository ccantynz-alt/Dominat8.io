import { NextResponse } from "next/server";
import { generateSeoPages } from "@/app/lib/seoGenerator";
import { saveSeoPages } from "@/app/lib/seoKV";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { keyword, count } = await req.json();

  if (!keyword || !count) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pages = generateSeoPages(keyword, count);
  await saveSeoPages(params.projectId, pages);

  return NextResponse.json({ ok: true, pagesCount: pages.length });
}
