import { kv } from "@vercel/kv";

/**
 * Simple KV helpers.
 */
export const KV = {
  get: kv.get.bind(kv),
  set: kv.set.bind(kv),
  del: kv.del.bind(kv),

  lpush: kv.lpush.bind(kv),
  rpush: kv.rpush.bind(kv),
  lrange: kv.lrange.bind(kv),

  sadd: kv.sadd.bind(kv),
  smembers: kv.smembers.bind(kv),
  srem: kv.srem.bind(kv),

  zadd: kv.zadd.bind(kv),
  zrange: kv.zrange.bind(kv),

  incr: kv.incr.bind(kv),

  async mustGet<T>(key: string): Promise<T> {
    const v = await kv.get<T>(key);
    if (v === null || v === undefined) {
      throw new Error(`KV missing key: ${key}`);
    }
    return v;
  },
};
