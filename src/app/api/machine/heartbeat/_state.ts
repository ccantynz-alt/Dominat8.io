/**
 * Minimal heartbeat state to satisfy imports during build.
 * Intentionally tiny: provides stable primitives with no external deps.
 */
export type HeartbeatState = {
  lastBeatAt: number;
  count: number;
};

const state: HeartbeatState = {
  lastBeatAt: 0,
  count: 0,
};

export function getState(): HeartbeatState {
  return state;
}

export function touch(now: number = Date.now()): HeartbeatState {
  state.lastBeatAt = now;
  state.count += 1;
  return state;
}