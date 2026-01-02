import { NextResponse } from "next/server";
import { getDailySeries, getTopPages, getRecentEvents } from "../../../../../lib/analyticsKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  const series = await getDailySeries(projectId, 14);
  const topPages = await getTopPages(projectId, 10);
  const recent = await getRecentEvents(projectId, 30);

  return NextResponse.json({
    ok: true,
    series,
    topPages,
    recent,
  });
}
