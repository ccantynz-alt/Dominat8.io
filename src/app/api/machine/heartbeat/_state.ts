export const LMM1_STAMP = "LMM1_STATE_V1";

export type MachineSnapshot = {
  ok: boolean;
  ts: number;
  note?: string | null;
};

export function initialSnapshot(): MachineSnapshot {
  return { ok: true, ts: Date.now(), note: "init" };
}
