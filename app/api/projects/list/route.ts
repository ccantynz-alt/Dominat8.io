import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/auth";
import { listProjects } from "../../../lib/projectsStore";

export async function GET() {
  const { userId } = await requireUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const projects = await listProjects(userId);
  return NextResponse.json({ ok: true, projects });
}
