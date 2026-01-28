import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return NextResponse.json(
    {
      ok: true,
      stamp: "PROBE_APP_20260129_101902",
      at: new Date().toISOString(),
      path: url.pathname,
      note: "ROUTE-PROBE: tells which file is being built (app vs src/app)."
    },
    { headers: { "cache-control": "no-store, max-age=0" } }
  );
}