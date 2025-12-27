import { z } from "zod";
import JSZip from "jszip";
import { kvJsonGet } from "../../../../lib/kv";
import { getCurrentUserId } from "../../../../lib/demoAuth";

type RunFile = {
  path: string;
  content: string;
};

const ParamsSchema = z.object({
  runId: z.string().min(1),
});

function filesKey(userId: string, runId: string) {
  return `runs:${userId}:${runId}:files`;
}

function safePath(p: string) {
  const path = p.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!path || path.includes("..")) return null;
  return path;
}

export async function GET(
  _req: Request,
  ctx: { params: { runId: string } }
) {
  const userId = await getCurrentUserId();
  const { runId } = ParamsSchema.parse(ctx.params);

  const files = await kvJsonGet<RunFile[]>(filesKey(userId, runId));

  if (!Array.isArray(files) || files.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: "No files for this run" }),
      { status: 404 }
    );
  }

  const zip = new JSZip();

  for (const f of files) {
    const path = safePath(f.path);
    if (!path) continue;
    zip.file(path, f.content ?? "");
  }

  const data = await zip.generateAsync({ type: "uint8array" });

  return new Response(data, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="run-${runId}.zip"`,
    },
  });
}
