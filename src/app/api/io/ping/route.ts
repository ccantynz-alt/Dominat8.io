export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("PONG: 
D8_IO_API_014B_20260206_203526
\n", {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "x-d8-proof": "
D8_IO_API_014B_20260206_203526
" }
  });
}
