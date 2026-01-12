/**
 * TEMP STUB:
 * Provide exports expected by SEO routes.
 */

export async function rateLimit(_key: string, _limit = 60, _windowSeconds = 60) {
  return { ok: true, allowed: true, remaining: _limit };
}

export async function rateLimitOrThrow(_key: string, _limit = 60, _windowSeconds = 60) {
  return { ok: true, allowed: true, remaining: _limit };
}
