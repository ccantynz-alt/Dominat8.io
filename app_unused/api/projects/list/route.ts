import { NextResponse } from "next/server";
import { requireUserId } from "@/app/api/_lib/auth";
import { listProjects } from "@/app/lib/projectsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await requireUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    }

    const projects = await listProjects(userId);
    return NextResponse.json({ ok: true, count: projects.length, projects }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to list projects" },
      { status: 500 }
    );
  }
}
