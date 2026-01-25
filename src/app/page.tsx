import dynamic from "next/dynamic";

// HARD: force this page to be dynamic (prevents static caching surprises)
export const dynamic = "force-dynamic";
export const revalidate = 0;
// In newer Next versions, this also helps enforce no-store behavior:
export const fetchCache = "force-no-store";

const nextDynamic = dynamic;

const HomeClient = nextDynamic(() => import("./_client/HomeClient"), {
  ssr: false,
});

function getDeployInfo() {
  const env = process.env;

  // These exist in many Vercel/Next setups; if missing, we still show something.
  const deployId =
    env.VERCEL_DEPLOYMENT_ID ||
    env.VERCEL_DEPLOYMENT_URL ||
    env.VERCEL_URL ||
    "";

  const gitSha =
    env.VERCEL_GIT_COMMIT_SHA ||
    env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    env.GIT_COMMIT_SHA ||
    "";

  const gitRef =
    env.VERCEL_GIT_COMMIT_REF ||
    env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
    env.GIT_BRANCH ||
    "";

  const nodeEnv = env.NODE_ENV || "";
  const vercelEnv = env.VERCEL_ENV || "";

  // Server timestamp: proves a fresh server render
  const serverIso = new Date().toISOString();

  return {
    serverIso,
    deployId,
    gitSha,
    gitRef,
    nodeEnv,
    vercelEnv,
  };
}

export default function Page() {
  const deploy = getDeployInfo();

  return (
    <main className="min-h-screen bg-black text-white">
      <HomeClient deploy={deploy} />
    </main>
  );
}