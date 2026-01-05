// app/api/dev/seed-generated/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST() {
  const demoHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Published Demo</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:40px;}
      .card{border:1px solid #e5e5e5;border-radius:12px;padding:20px;max-width:720px;}
      h1{margin:0 0 10px 0;}
      p{opacity:.85;line-height:1.5}
      code{background:#f6f6f6;padding:2px 6px;border-radius:6px}
      a{display:inline-block;margin-top:12px}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✅ Generated HTML Seeded</h1>
      <p>This demo page was stored into <code>generated:latest</code>.</p>
      <p>Now your Publish flow should work and show a page at <code>/p/&lt;projectId&gt;</code>.</p>
    </div>
  </body>
</html>`;

  await kv.set("generated:latest", demoHtml);

  return NextResponse.json({ ok: true, key: "generated:latest" });
}
