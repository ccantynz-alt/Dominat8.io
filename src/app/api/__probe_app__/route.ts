import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({
    ok: true,
    router: "app",
    file: "src/app/api/__probe_app__/route.ts",
    method: "GET",
    url: req.url,
    nowIso: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return NextResponse.json({
    ok: true,
    router: "app",
    file: "src/app/api/__probe_app__/route.ts",
    method: "POST",
    url: req.url,
    nowIso: new Date().toISOString(),
  });
}
