/**
 * Minimal heartbeat feed to satisfy imports during build.
 * emit() is a no-op hook (returns a small payload) so route code can call it safely.
 */
export type HeartbeatEvent = {
  at: number;
  message?: string;
};

export function emit(message?: string): HeartbeatEvent {
  return { at: Date.now(), message };
}