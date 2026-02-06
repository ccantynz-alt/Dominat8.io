import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type IoBody = {
  ok: boolean;
  stamp: string;
  git: string;
  now: string;
};

function makeBody(): IoBody {
  const git =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "unknown";
  return {
    ok: true,
    stamp: "D8_IO_PR_FIX_044_20260207_070340",
    git,
    now: new Date().toISOString(),
  };
}

export async function GET() {
  const body: IoBody = makeBody();
  const res = NextResponse.json(body, { status: 200 });
  res.headers.set("X-D8-Proof", body.stamp);
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}