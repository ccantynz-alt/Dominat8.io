// app/api/runs/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { KV } from "../../lib/kv";
import { makeId } from "../../lib/ids";
import { getCurrentUserId } from "../../lib/demoAuth";

type Run = {
  id: string;
  projectId: string;
  createdAt: number;
  createdBy: string;
  status: "running" | "completed" | "failed";
  title: string;
};

export async function POST() {
  try {
    const userId = getCurrentUserId();
    const runId = makeId("run");
    const now = Date.now();

    const run: Run = {
      id: runId,
      projectId: "demo-project",
      createdAt: now,
      createdBy: userId,
      status: "running",
      title: "Simulated Run",
    };

    // Helpful explicit error if KV wrapper is missing methods
    if (typeof (KV as any).set !== "function") {
      throw new Error(
        "KV.set is not a function. Your app/lib/kv.ts wrapper currently does not expose set()."
      );
    }

    await (KV as any).set(`run:${runId}`, run);

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    // Send back something you can see in the browser
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs POST",
        message,
      },
      { status: 500 }
    );
  }
}
