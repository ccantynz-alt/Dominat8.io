// app/api/env-check/route.ts
import { NextResponse } from "next/server";

const KEYS = [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "KV_REST_API_READ_ONLY_TOKEN",
  "VERCEL_KV_REST_API_URL",
  "VERCEL_KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "REDIS_URL",
  "UPSTASH_REDIS_URL",
  "VERCEL_ENV",
  "NODE_ENV",
];

export async function GET() {
  const present: Record<string, boolean> = {};
  for (const k of KEYS) {
    present[k] = !!process.env[k] && String(process.env[k]).trim().length > 0;
  }
  return NextResponse.json({ ok: true, present });
}
