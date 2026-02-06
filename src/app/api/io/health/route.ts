export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body = { ok: true, stamp: "
D8_IO_MEGA_013_FIX_20260206_202733
", git_sha: "
0d81664886595553ce9f623607c402ad933d0f20
", time: new Date().toISOString() };
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json; charset=utf-8", "x-d8-proof": "
D8_IO_MEGA_013_FIX_20260206_202733
" } });
}