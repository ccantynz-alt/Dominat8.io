import { kv } from "./kv";
import { K } from "./keys";

/**
 * A simple KV lease to prevent multiple cron ticks from processing the queue at once.
 */
export async function acquireLease(name: string, ttlSeconds: number) {
  const key = K.lease(name);
  // SET key value NX EX ttl
  // @vercel/kv supports raw commands
  const value = `${Date.now()}`;
  const ok = await kv.set(key, value, { nx: true, ex: ttlSeconds });
  return ok === "OK";
}

export async function releaseLease(name: string) {
  const key = K.lease(name);
  await kv.del(key);
}
