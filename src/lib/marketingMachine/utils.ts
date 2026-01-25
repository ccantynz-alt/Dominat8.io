export function nowIso(): string { return new Date().toISOString(); }

export function safeJsonParse<T>(s: string | null | undefined, fallback: T): T {
  try { if (!s) return fallback; return JSON.parse(s) as T; } catch { return fallback; }
}

export function safeJsonStringify(v: unknown): string {
  try { return JSON.stringify(v); } catch { return "null"; }
}

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toTitle(input: string): string {
  const s = (input || "").trim().replace(/[-_]+/g, " ");
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

export function shortId(prefix = "mm"): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rnd}`;
}
/**
 * Compatibility export: publisher.ts expects randomId().
 * Alias to shortId() to keep build green.
 */
export function randomId(prefix = "mm"): string {
  return shortId(prefix);
}
/**
 * Compatibility export: store.ts expects uniq().
 * Returns a de-duplicated array preserving first-seen order.
 */
export function uniq<T>(arr: T[]): T[] {
  const out: T[] = [];
  const seen = new Set<unknown>();
  for (const v of arr ?? []) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}