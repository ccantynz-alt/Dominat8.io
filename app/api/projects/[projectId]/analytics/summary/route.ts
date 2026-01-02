import { NextResponse } from "next/server";
import { getDailySeries, getTopPages, getRecentEvents } from "@/app/lib/analyticsKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  const series = await getDailySeries(projectId, 14);
  const topPages = await getTopPages(projectId, 7, 10);
  const recent = await getRecentEvents(projectId, 30);

  return NextResponse.json({
    ok: true,
    series,    // newest->oldest
    topPages,  // last 7 days approx (from recent feed)
    recent,
  });
}
