import { NextResponse } from "next/server";
import {
  getDailySeries,
  getTopPages,
  getRecentEvents,
} from "../../../../../lib/analyticsKV";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  // ✅ PROOF MARKER: ANALYTICS_SUMMARY_ROUTE_V2
  // ✅ Stubs have simplified signatures in this codebase
  const series = await getDailySeries(projectId);
  const topPages = await getTopPages(projectId);
  const recent = await getRecentEvents(projectId);

  return NextResponse.json({
    ok: true,
    projectId,
    series,
    topPages,
    recent,
    marker: "ANALYTICS_SUMMARY_ROUTE_V2",
  });
}
