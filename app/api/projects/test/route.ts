import { NextResponse } from "next/server";
import { kvSaveProject } from "@/lib/kvStore";

export async function GET() {
  const id = "proj_test_" + Date.now().toString(16);

  const project = await kvSaveProject({
    id,
    name: "KV Test Project",
    templateId: "test",
    templateName: "Test",
    seedPrompt: "Test prompt",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    created: project,
  });
}
