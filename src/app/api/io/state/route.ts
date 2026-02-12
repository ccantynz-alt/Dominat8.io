import { NextResponse } from "next/server";

type Body = {
  ok: boolean;
  route: string;
  stamp: string;
  git: string;
  now: string;
};

export async function GET(): Promise<Response> {
  const body: Body = {
    ok: true,
    route: "state",
    stamp: "D8_IO_HARD_FIX_043_20260207_063410",
    git: "b63657f9b701877e2bb682535314d30de6af35fa",
    now: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "X-D8-Proof": "D8_IO_HARD_FIX_043_20260207_063410",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}