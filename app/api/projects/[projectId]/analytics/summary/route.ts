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
    note: "Analytics summary is stub-friendly. Wire real tracking later.",
  });
}
