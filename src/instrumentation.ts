import { buildStamp } from "@/lib/buildStamp";

export function register() {
  try {
    const s = buildStamp();
    // This prints into Vercel runtime logs at startup.
    console.log("D8_INSTRUMENTATION_READY", {
      stamp: s.stamp,
      sha: s.sha,
      timeIso: s.timeIso,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
    });
  } catch (e) {
    console.log("D8_INSTRUMENTATION_ERROR", String((e as any)?.message || e));
  }
}