export type FeedEvent = {
  ts: number;
  type: string;
  detail?: any;
};

// Minimal no-op emitter. Safe for builds; can be upgraded later to persist to KV/DB.
export async function emit(_event: FeedEvent): Promise<void> {
  return;
}
