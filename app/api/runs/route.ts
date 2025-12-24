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

function safeEnvInfo() {
  const upUrl = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const kvUrl = (process.env.KV_REST_API_URL ?? "").trim();

  return {
    hasUpstashUrl: !!upUrl,
    upstashUrlHost: upUrl ? new URL(upUrl.startsWith("http") ? upUrl : `https://${upUrl}`).host : null,
    hasKvUrl: !!kvUrl,
    kvUrlHost: kvUrl ? new URL(kvUrl.startsWith("http") ? kvUrl : `https://${kvUrl}`).host : null,
    hasUpstashToken: !!(process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim(),
    hasKvToken: !!(process.env.KV_REST_API_TOKEN ?? "").trim(),
  };
}

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

    await KV.set(`run:${runId}`, run);

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs POST",
        message,
        env: safeEnvInfo(),
      },
      { status: 500 }
    );
  }
}
