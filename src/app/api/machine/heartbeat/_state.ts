/**
 * Heartbeat state model (minimal).
 * Goal: keep builds green and keep runtime safe (no side effects).
 */

export const LMM1_STAMP = "LMM1_HEARTBEAT_STATE_V1";

export type MachineSnapshot = {
  stamp: string;
  ts: number;
  ok: boolean;
  note?: string;
};

export function initialSnapshot(): MachineSnapshot {
  return {
    stamp: LMM1_STAMP,
    ts: Date.now(),
    ok: true,
    note: "initial",
  };
}
