import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !/^[a-f0-9]{12}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const rows = await db
      .select({ blobUrl: schema.sites.blobUrl })
      .from(schema.sites)
      .where(eq(schema.sites.id, id))
      .limit(1);

    if (!rows[0]?.blobUrl) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Not Found — Dominat8.io</title>
        <style>body{background:#06080e;color:#e9eef7;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
        .c{text-align:center}.n{font-size:72px;font-weight:900;color:rgba(61,240,255,0.8)}h2{font-size:24px;margin:0 0 8px}p{color:rgba(255,255,255,0.4);margin:0 0 24px}
        a{display:inline-block;padding:10px 22px;border-radius:10px;background:linear-gradient(135deg,#00C97A,#00B36B);color:#fff;text-decoration:none;font-weight:700}
        </style></head><body><div class="c"><div class="n">404</div><h2>Site not found</h2>
        <p>This site may have expired or been removed.</p><a href="/">Build a new site →</a></div></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Fetch the HTML from Vercel Blob
    const res = await fetch(rows[0].blobUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Blob fetch failed: ${res.status}`);
    }

    const html = await res.text();

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Frame-Options": "SAMEORIGIN",
        "X-D8-Site-Id": id,
      },
    });
  } catch {
    return new Response("Error loading site", { status: 500 });
  }
}
