// app/api/runs/[runId]/files/route.ts
import { NextResponse } from "next/server";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function runKey(userId: string, runId: string) {
  return `runs:${
