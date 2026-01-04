import { kv } from "@vercel/kv";

function extractHtml(data: unknown): string | null {
  // Case 1: KV stored raw HTML string
  if (typeof data === "string" && data.trim()) return data;

  // Case 2: KV stored { html: "<html>..." }
  if (data && typeof data === "object" && typeof (data as any).html === "string") {
    const html = String((data as any).html);
    return html.trim() ? html : null;
  }

  // Case 3: KV stored { data: { html: "<html>..." } }
  if (
    data &&
    typeof data === "object" &&
    (data as any).data &&
    typeof (data as any).data === "object" &&
    typeof (data as any).data.html === "string"
  ) {
    const html = String((data as any).data.html);
    return html.trim() ? html : null;
  }

  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;

  const data = await kv.get(`generated:run:${runId}`);
  const html = extractHtml(data);

  if (!html) {
    return new Response(
      "No generated HTML found for this run. Execute the run first, then refresh the generated page and try download again.",
      { status: 404 }
    );
  }

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
