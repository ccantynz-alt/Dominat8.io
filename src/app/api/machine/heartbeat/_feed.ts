/**
 * Heartbeat feed shim.
 * Must satisfy route.ts calling: emit('heartbeat', 'machine heartbeat', s.state)
 * No external deps, no side effects.
 */

export type FeedEvent = {
  at: number;
  type: string;
  message?: string;
  payload?: unknown;
};

export function emit(): FeedEvent;
export function emit(message: string): FeedEvent;
export function emit(type: string, message: string, payload: unknown): FeedEvent;
export function emit(a?: string, b?: string, c?: unknown): FeedEvent {
  // Determine call shape.
  // 0 args: emit()
  // 1 arg: emit(message)
  // 3 args: emit(type, message, payload)
  const at = Date.now();

  if (typeof a === "string" && typeof b === "string") {
    return { at, type: a, message: b, payload: c };
  }

  if (typeof a === "string") {
    return { at, type: "log", message: a };
  }

  return { at, type: "log" };
}