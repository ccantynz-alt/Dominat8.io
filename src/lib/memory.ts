/**
 * Memory Tool — Cross-Session User Preferences
 *
 * Persists user preferences, brand settings, and design decisions
 * across all sessions. When a user says:
 *   "Remember my brand colors are #1A2B3C and #FF6B00"
 *   "Always use Montserrat for headings"
 *   "My business is a SaaS for dog walkers"
 *
 * These memories are stored and automatically injected into every
 * future generation, creating increasingly personalized output.
 *
 * Memory types:
 *   - brand: Colors, fonts, logos, style preferences
 *   - business: Industry, services, target audience, USPs
 *   - design: Layout preferences, section preferences, animation style
 *   - content: Tone of voice, key phrases, contact info
 */

import { kv } from "@vercel/kv";

export interface Memory {
  id: string;
  category: "brand" | "business" | "design" | "content";
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

function memoryKey(userId: string): string {
  return `memory:${userId}`;
}

// ── Read all memories ────────────────────────────────────────────────────────

export async function getMemories(userId: string): Promise<Memory[]> {
  const memories = await kv.get<Memory[]>(memoryKey(userId));
  return memories ?? [];
}

export async function getMemoriesByCategory(
  userId: string,
  category: Memory["category"],
): Promise<Memory[]> {
  const all = await getMemories(userId);
  return all.filter((m) => m.category === category);
}

// ── Write a memory ───────────────────────────────────────────────────────────

export async function setMemory(
  userId: string,
  category: Memory["category"],
  key: string,
  value: string,
): Promise<Memory> {
  const all = await getMemories(userId);
  const now = new Date().toISOString();

  // Update existing or create new
  const existing = all.find((m) => m.category === category && m.key === key);
  if (existing) {
    existing.value = value;
    existing.updatedAt = now;
    await kv.set(memoryKey(userId), all);
    return existing;
  }

  const memory: Memory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    category,
    key,
    value,
    createdAt: now,
    updatedAt: now,
  };

  all.push(memory);
  await kv.set(memoryKey(userId), all);
  return memory;
}

// ── Delete a memory ──────────────────────────────────────────────────────────

export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  const all = await getMemories(userId);
  const filtered = all.filter((m) => m.id !== memoryId);
  if (filtered.length === all.length) return false;
  await kv.set(memoryKey(userId), filtered);
  return true;
}

// ── Clear all memories ───────────────────────────────────────────────────────

export async function clearMemories(userId: string): Promise<void> {
  await kv.del(memoryKey(userId));
}

// ── Format memories as context for Claude ────────────────────────────────────
// This is the key function — it converts stored memories into a system prompt
// section that Claude uses to personalize output.

export async function formatMemoriesForPrompt(userId: string): Promise<string> {
  const memories = await getMemories(userId);
  if (memories.length === 0) return "";

  const sections: Record<string, string[]> = {
    brand: [],
    business: [],
    design: [],
    content: [],
  };

  for (const m of memories) {
    sections[m.category].push(`- ${m.key}: ${m.value}`);
  }

  const parts: string[] = [
    "\n\n--- USER PREFERENCES (from memory) ---",
  ];

  if (sections.brand.length > 0) {
    parts.push(`\nBRAND:\n${sections.brand.join("\n")}`);
  }
  if (sections.business.length > 0) {
    parts.push(`\nBUSINESS:\n${sections.business.join("\n")}`);
  }
  if (sections.design.length > 0) {
    parts.push(`\nDESIGN PREFERENCES:\n${sections.design.join("\n")}`);
  }
  if (sections.content.length > 0) {
    parts.push(`\nCONTENT:\n${sections.content.join("\n")}`);
  }

  parts.push("\nApply these preferences to ALL output. They override defaults.");
  parts.push("--- END USER PREFERENCES ---");

  return parts.join("\n");
}
