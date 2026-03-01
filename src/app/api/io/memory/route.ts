import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  getMemories,
  setMemory,
  deleteMemory,
  clearMemories,
  formatMemoriesForPrompt,
  type Memory,
} from "@/lib/memory";

export const runtime = "nodejs";

/**
 * Memory API — CRUD for user preferences
 *
 * GET    — list all memories
 * POST   — create/update a memory
 * DELETE — delete a memory (or all with ?clear=true)
 */

// GET — list all memories for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const memories = await getMemories(userId);
  const promptContext = await formatMemoriesForPrompt(userId);

  // Group by category for display
  const grouped: Record<string, Memory[]> = {
    brand: [],
    business: [],
    design: [],
    content: [],
  };
  for (const m of memories) {
    grouped[m.category].push(m);
  }

  return Response.json({
    ok: true,
    memories,
    grouped,
    count: memories.length,
    promptPreview: promptContext || "(no memories stored yet)",
  });
}

// POST — create or update a memory
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { category, key, value } = await req.json();

  if (!category || !key || !value) {
    return Response.json(
      { error: "category, key, and value required" },
      { status: 400 },
    );
  }

  const validCategories = ["brand", "business", "design", "content"];
  if (!validCategories.includes(category)) {
    return Response.json(
      { error: `category must be one of: ${validCategories.join(", ")}` },
      { status: 400 },
    );
  }

  const memory = await setMemory(
    userId,
    category as Memory["category"],
    key,
    value,
  );

  return Response.json({
    ok: true,
    memory,
    message: `Remembered: ${key} = ${value}`,
  });
}

// DELETE — remove a memory or clear all
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { memoryId, clearAll } = await req.json();

  if (clearAll) {
    await clearMemories(userId);
    return Response.json({ ok: true, message: "All memories cleared." });
  }

  if (!memoryId) {
    return Response.json(
      { error: "memoryId or clearAll required" },
      { status: 400 },
    );
  }

  const deleted = await deleteMemory(userId, memoryId);

  return Response.json({
    ok: true,
    deleted,
    message: deleted ? "Memory deleted." : "Memory not found.",
  });
}
