/**
 * TEMP STUB:
 * Original depended on '@/app/lib/kv' alias.
 * Keep a simple no-op limiter so imports don't break.
 */
export async function rateLimit(_key: string, _limit = 60, _windowSeconds = 60) {
  return { ok: true, allowed: true, remaining: _limit };
}
