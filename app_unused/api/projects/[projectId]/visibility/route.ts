// app/api/projects/[projectId]/visibility/route.ts
import { NextResponse } from "next/server";
import { storeGet, storeSet } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/isAdmin";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

const publicIndexKey = "public:projects:index";

async function readPublicIndex(): Promise<string[]> {
  const v = await storeGet(publicIndexKey);
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return [];
}

async function writePublicIndex(ids: string[]) {
  // de-dupe + stable
  const unique = Array.from(new Set(ids)).filter(Boolean);
  await storeSet(publicIndexKey, unique);
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const v = await storeGet(visibilityKey(params.projectId));
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

  const projectId = params.projectId;
  const visibility: Visibility = body?.visibility === "public" ? "public" : "private";

  // Save per-project visibility
  await storeSet(visibilityKey(projectId), visibility);

  // Update public index
  const idx = await readPublicIndex();
  if (visibility === "public") {
    idx.unshift(projectId);
    await writePublicIndex(idx);
  } else {
    const filtered = idx.filter((id) => id !== projectId);
    await writePublicIndex(filtered);
  }

  return NextResponse.json({ ok: true, projectId, visibility });
}
