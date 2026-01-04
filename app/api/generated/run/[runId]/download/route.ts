import { kv } from "@vercel/kv";

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;

  const data = await kv.get(`generated:run:${runId}`);

  if (!data || typeof data !== "object" || !(data as any).html) {
    return new Response("No generated HTML found for this run.", { status: 404 });
  }

  const html = String((data as any).html);
  const filename = `generated-${runId}.html`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
