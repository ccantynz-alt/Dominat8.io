import { NextResponse } from "next/server";
import { BUILD_STAMP } from "@/lib/buildStamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = [
  // Common KV / Upstash
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",

  // Admin tokens (presence only)
  "ADMIN_TOKEN",
  "D8_ADMIN_TOKEN",
  "ALE_ADMIN_TOKEN",

  // Stripe (presence only)
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",

  // Auth (presence only)
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",

  // next build
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_GIT_COMMIT_SHA",
];

export async function GET() {
  const presence: Record<string, boolean> = {};
  for (const k of KEYS) presence[k] = !!(process.env[k] && String(process.env[k]).trim());
  return NextResponse.json({
    ok: true,
    build: BUILD_STAMP,
    presence,
    note: "Presence-only env report. Values are never returned.",
  });
}