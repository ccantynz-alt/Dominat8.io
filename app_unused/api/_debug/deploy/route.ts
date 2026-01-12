export async function GET() {
  return Response.json({
    ok: true,
    route: "/api/_debug/deploy",
    time: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  });
}
