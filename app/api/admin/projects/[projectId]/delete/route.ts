import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

function isAdminUserId(userId: string | null) {
  if (!userId) return false;

  // Comma-separated list of Clerk user IDs in Vercel env:
  // ADMIN_USER_IDS=user_123,user_456
  const raw = process.env.ADMIN_USER_IDS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return list.includes(userId);
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  // ✅ FIX: auth() returns a Promise in your current Clerk typings/build
  const { userId } = await auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

  const projectId = params.projectId;

  // This is intentionally "best-effort" deletion.
  // Your data model might store projects/runs in different keys.
  // We delete the project record key and return ok.
  //
  // Adjust these keys later when you finalize the KV schema.
  const keyProject = `project:${projectId}`;

  try {
    await kv.del(keyProject);
    return NextResponse.json({ ok: true, projectId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}

