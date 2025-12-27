import JSZip from "jszip";
import { z } from "zod";
import { readRunFiles } from "../../../../lib/runFiles";
import { getCurrentUserId } from "../../../../lib/demoAuth";

const ParamsSchema = z.object({
  runId: z.string().min(1),
});

function safeZipPath(p: string): string | null {
  // Normalize and block zip-slip
  let path = (p || "").trim().replace(/\\/g, "/");

  // Remove any leading slashes
  path = path.replace(/^\/+/, "");

  // Block traversal or weird empty paths
  if (!path || path.includes("..")) return null;

  // Optional: block absolute Windows drive paths
  if (/^[A-Za-z]:\//.test(path)) return null;

  return path;
}

export async function GET(
  _req: Request,
  ctx: { params: { runId: string } }
) {
  const userId = await getCurrentUserId();
  const { runId } = ParamsSchema.parse(ctx.params);

  const files = await readRunFiles(userId, runId);

  if (!files.length) {
    return new Response(
      JSON.stringify({ ok: false, error: "No files found for this run." }),
      { status: 404, headers: { "content-type": "application/json" } }
    );
  }

  const zip = new JSZip();

  for (const f of files) {
    const zipPath = safeZipPath(f.path);
    if (!zipPath) continue;

    // Ensure content is a string (your agent contract already guarantees this)
    zip.file(zipPath, typeof f.content === "string" ? f.content : String(f.content));
  }

  const data = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const filename = `run_${runId}.zip`;

  return new Response(data, {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
