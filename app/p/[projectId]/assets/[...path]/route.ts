import { kv } from "@vercel/kv";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; path: string[] } }
) {
  const { projectId, path } = params;

  if (!projectId || !path || path.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const assetPath = path.join("/");
  const key = `asset:project:${projectId}:${assetPath}`;

  const data = await kv.get<any>(key);
  if (!data || !data.b64) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Buffer.from(data.b64, "base64");
  const contentType = data.contentType || "application/octet-stream";

  return new Response(bytes, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
