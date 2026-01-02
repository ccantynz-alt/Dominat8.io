// app/api/projects/[projectId]/visibility/route.ts
import { NextResponse } from "next/server";
import { storeGet, storeSet } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/isAdmin";

type Visibility = "public" | "private";

function key(projectId: string) {
  return `project:visibility:${projectId}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const v = await storeGet(key(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";
  return NextResponse.json({ ok: true, projectId: params.projectId, visibility });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const visibility: Visibility = body?.visibility === "public" ? "public" : "private";
  await storeSet(key(params.projectId), visibility);

  return NextResponse.json({ ok: true, projectId: params.projectId, visibility });
}
