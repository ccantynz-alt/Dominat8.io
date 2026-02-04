export const dynamic = "force-dynamic";

function pickCommit(): string {
  const v = process.env.VERCEL_GIT_COMMIT_SHA;
  const r = process.env.RENDER_GIT_COMMIT;
  const g = process.env.GITHUB_SHA;
  return (v || r || g || "UNKNOWN_COMMIT").slice(0, 40);
}

function pickEnv(): string {
  return (process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown");
}

export async function GET() {
  const now = new Date().toISOString();
  const commit = pickCommit();
  const env = pickEnv();

  const payload = {
    ok: true,
    stamp: "D8_IO_STAMP_20260205_085457",
    now,
    env,
    commit,
    render: {
      service_id: process.env.RENDER_SERVICE_ID || null,
      instance_id: process.env.RENDER_INSTANCE_ID || null,
      git_commit: process.env.RENDER_GIT_COMMIT || null
    },
    vercel: {
      env: process.env.VERCEL_ENV || null,
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID || null
    }
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache"
    }
  });
}
