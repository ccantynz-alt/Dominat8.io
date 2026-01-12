// app/lib/id.ts
export function uid(prefix = "id"): string {
  // crypto.randomUUID() is available in modern Node runtimes (Vercel)
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}_${id}`;
}
