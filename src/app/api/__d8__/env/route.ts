import { NextResponse } from "next/server";
import { buildStamp } from "@/lib/buildStamp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * SAFE env introspection:
 * - never returns secret values
 * - only returns presence/length
 */
function present(name: string) {
  const v = process.env[name];
  return v ? { present: true, length: v.length } : { present: false };
}

export async function GET() {
  const s = buildStamp();
  return NextResponse.json({
    ok: true,
    ...s,
    env: {
      NODE_ENV: present("NODE_ENV"),
      VERCEL: present("VERCEL"),
      VERCEL_ENV: present("VERCEL_ENV"),
      VERCEL_URL: present("VERCEL_URL"),
      NEXT_PUBLIC_SITE_URL: present("NEXT_PUBLIC_SITE_URL"),
      UPSTASH_REDIS_REST_URL: present("UPSTASH_REDIS_REST_URL"),
      UPSTASH_REDIS_REST_TOKEN: present("UPSTASH_REDIS_REST_TOKEN"),
      OPENAI_API_KEY: present("OPENAI_API_KEY"),
    },
  }, {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}