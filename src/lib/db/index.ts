/**
 * Database connection — Neon serverless Postgres via Drizzle ORM
 *
 * Uses @neondatabase/serverless for WebSocket-based connections
 * that work in serverless/edge environments (Vercel, Cloudflare, etc.).
 *
 * Requires: DATABASE_URL env var (Neon connection string)
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon Postgres connection string to .env.local"
    );
  }
  return url;
}

// Lazy singleton — created on first use
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(getDatabaseUrl());
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Convenience alias
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { schema };
