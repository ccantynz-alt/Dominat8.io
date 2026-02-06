export const dynamic = "force-dynamic";

type Body = {
  ok: boolean;
  stamp: string;
  git: string;
  now: string;
  kind: "ping";
};

function json(body: Body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-d8-proof": body.stamp
    }
  });
}

export async function GET() {
  const body: Body = {
    ok: true,
    stamp: "D8_IO_API_ping_046_20260207_090306",
    git: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "unknown",
    now: new Date().toISOString(),
    kind: "ping"
  };
  return json(body, 200);
}