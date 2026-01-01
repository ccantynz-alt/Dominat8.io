export function kvNowISO() {
  return new Date().toISOString();
}

/**
 * Minimal placeholder KV helpers so the build compiles.
 * Replace with your real Upstash/Vercel KV implementation when ready.
 */
export async function kvJsonGet<T>(_key: string): Promise<T | null> {
  return null;
}

export async function kvJsonSet<T>(_key: string, _value: T): Promise<void> {
  return;
}
