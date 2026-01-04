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

  // ✅ FIX: getDailySeries now takes 1 argument
  const series = await getDailySeries(projectId);

  const topPages = await getTopPages(projectId, 7, 10);
  const recent = await getRecentEvents(projectId, 30);

  return NextResponse.json({
    ok: true,
    projectId,
    series,
    topPages,
    recent,
    note: "Analytics summary is stub-friendly. Wire real tracking later.",
  });
}
