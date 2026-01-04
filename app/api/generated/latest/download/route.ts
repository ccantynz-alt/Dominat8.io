import { kv } from "@vercel/kv";

export async function GET() {
  const data = await kv.get("generated:latest");

  if (!data || typeof data !== "object" || !(data as any).html) {
    return new Response("No latest generated HTML found.", { status: 404 });
  }

  const html = String((data as any).html);
  const runId = (data as any).runId ? String((data as any).runId) : "latest";
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
