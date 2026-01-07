import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId || !projectId.startsWith("proj_")) {
      return NextResponse.json(
        { ok: false, error: "Invalid projectId" },
        { status: 400 }
      );
    }

    const projectKey = `project:${projectId}`;
    const exists = await kv.exists(projectKey);

    // 🔧 AUTO-CREATE minimal project if missing
    if (!exists) {
      await kv.hset(projectKey, {
        id: projectId,
        createdAt: new Date().toISOString(),
        recovered: "true",
      });
    }

    const indexKey = "projects:index";
    const current = (await kv.get<string[]>(indexKey)) || [];

    if (!current.includes(projectId)) {
      await kv.set(indexKey, [projectId, ...current]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register project failed:", err);
    return NextResponse.json(
      { ok: false, error: "Register failed" },
      { status: 500 }
    );
  }
}
