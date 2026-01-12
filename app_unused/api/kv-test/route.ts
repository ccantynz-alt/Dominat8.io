// app/api/kv-test/route.ts
import { NextResponse } from "next/server";

function bool(v: any) {
  return !!v && String(v).trim().length > 0;
}

export async function GET() {
  const env = process.env;

  const has = {
    // Vercel KV (REST)
    hasKVUrl: bool(env.KV_REST_API_URL),
    hasKVToken: bool(env.KV_REST_API_TOKEN),
    hasKVReadOnlyToken: bool(env.KV_REST_API_READ_ONLY_TOKEN),

    // Older / alternate naming seen in some setups
    hasVercelKvUrl: bool(env.VERCEL_KV_REST_API_URL),
    hasVercelKvToken: bool(env.VERCEL_KV_REST_API_TOKEN),

    // Upstash REST
    hasUpstashUrl: bool(env.UPSTASH_REDIS_REST_URL),
    hasUpstashToken: bool(env.UPSTASH_REDIS_REST_TOKEN),

    // Sometimes people store a single redis URL/token pair
    hasRedisUrl: bool(env.REDIS_URL) || bool(env.UPSTASH_REDIS_URL),
    hasRedisToken: bool(env.REDIS_TOKEN),
  };

  const anyKvConfigured =
    (has.hasKVUrl && has.hasKVToken) ||
    (has.hasVercelKvUrl && has.hasVercelKvToken) ||
    (has.hasUpstashUrl && has.hasUpstashToken);

  return NextResponse.json({
    ok: true,
    ...has,
    anyKvConfigured,
    // Helpful (non-sensitive) runtime info
    nodeEnv: env.NODE_ENV || "",
    vercelEnv: env.VERCEL_ENV || "",
    region: env.VERCEL_REGION || "",
  });
}
