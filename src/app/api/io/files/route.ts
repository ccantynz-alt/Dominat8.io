import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Files API — Upload Once, Use Everywhere
 *
 * Users upload brand assets once and they persist across all API calls:
 *   - Brand guidelines PDF → every generation follows them
 *   - Logo image → extracted colors used in every site
 *   - Style guide document → consistent design across generations
 *   - Content document → real copy used instead of invented content
 *
 * Uses Anthropic's Files API to upload to Claude's servers once,
 * then reference by file_id in subsequent calls. No re-uploading.
 *
 * This dramatically improves output consistency for repeat users.
 */

// POST — upload a file to Claude's file storage
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { file, filename, type, purpose } = await req.json();
  if (!file || !filename) {
    return Response.json(
      { error: "file (base64) and filename required" },
      { status: 400 },
    );
  }

  // Validate purpose
  const validPurposes = [
    "brand-guidelines",
    "logo",
    "style-guide",
    "content",
    "wireframe",
    "reference",
  ];
  const filePurpose = validPurposes.includes(purpose) ? purpose : "reference";

  const client = new Anthropic({ apiKey: anthropicKey });

  // Upload file to Anthropic's Files API
  const base64Data = file.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const blob = new Blob([buffer], { type: type || "application/octet-stream" });
  const fileObj = new File([blob], filename, { type: type || "application/octet-stream" });

  const uploaded = await client.files.upload({
    file: fileObj,
    purpose: "vision",
  });

  // Store file reference in KV for this user
  const userFilesKey = `files:${userId}`;
  const existingFiles = (await kv.get<FileRecord[]>(userFilesKey)) ?? [];

  const fileRecord: FileRecord = {
    fileId: uploaded.id,
    filename,
    type: type || "application/octet-stream",
    purpose: filePurpose,
    uploadedAt: new Date().toISOString(),
    sizeBytes: buffer.length,
  };

  existingFiles.push(fileRecord);
  await kv.set(userFilesKey, existingFiles);

  return Response.json({
    ok: true,
    file: fileRecord,
    message: `File "${filename}" uploaded. It will be automatically included in your future generations based on its purpose.`,
  });
}

// GET — list user's uploaded files
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const files = (await kv.get<FileRecord[]>(`files:${userId}`)) ?? [];

  return Response.json({
    ok: true,
    files,
    count: files.length,
  });
}

// DELETE — remove a file
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { fileId } = await req.json();
  if (!fileId) {
    return Response.json({ error: "fileId required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      await client.files.delete(fileId);
    } catch { /* file may already be deleted on Anthropic side */ }
  }

  const userFilesKey = `files:${userId}`;
  const existingFiles = (await kv.get<FileRecord[]>(userFilesKey)) ?? [];
  const filtered = existingFiles.filter((f) => f.fileId !== fileId);
  await kv.set(userFilesKey, filtered);

  return Response.json({ ok: true, deleted: fileId });
}

interface FileRecord {
  fileId: string;
  filename: string;
  type: string;
  purpose: string;
  uploadedAt: string;
  sizeBytes: number;
}
