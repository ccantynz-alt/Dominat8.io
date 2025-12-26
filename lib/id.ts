export function uid(prefix: string) {
  // Short, URL-safe ID
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`;
}
