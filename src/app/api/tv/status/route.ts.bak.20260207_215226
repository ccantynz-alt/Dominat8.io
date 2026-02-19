export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function env(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export async function GET() {
  const now = new Date().toISOString();

  // Build/commit metadata (best-effort; varies by environment)
  const sha =
    env("VERCEL_GIT_COMMIT_SHA") ||
    env("NEXT_PUBLIC_BUILD_SHA") ||
    env("NEXT_PUBLIC_BUILD_COMMIT") ||
    "";

  const branch =
    env("VERCEL_GIT_COMMIT_REF") ||
    env("NEXT_PUBLIC_BUILD_BRANCH") ||
    "";

  const stamp =
    env("NEXT_PUBLIC_BUILD_STAMP") ||
    env("BUILD_STAMP") ||
    "";

  const vercelEnv = env("VERCEL_ENV");
  const vercelUrl = env("VERCEL_URL");
  const region = env("VERCEL_REGION");

  const body = {
    ok: true,
    service: "dominat8.io",
    ts: now,
    stamp: stamp || "NO_STAMP",
    sha: sha || "NO_SHA",
    branch: branch || "NO_BRANCH",
    vercel: {
      env: vercelEnv || "UNKNOWN",
      url: vercelUrl || "",
      region: region || "",
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}