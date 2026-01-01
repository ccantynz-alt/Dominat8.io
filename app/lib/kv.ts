export function kvNowISO() {
  return new Date().toISOString();
}

/**
 * Minimal placeholder KV client + helpers so the build compiles.
 * Replace with real Upstash/Vercel KV later.
 */
export const kv = {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  },
  async set<T>(_key: string, _value: T): Promise<void> {
    return;
  },
  async del(_key: string): Promise<void> {
    return;
  }
};

export async function kvJsonGet<T>(_key: string): Promise<T | null> {
  return null;
}

export async function kvJsonSet<T>(_key: string, _value: T): Promise<void> {
  return;
}
