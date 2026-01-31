export type MachineState =
  | 'IDLE'
  | 'RECOVERING'
  | 'DEGRADED'
  | 'HUMAN_REQUIRED';

export const LMM1_STAMP = 'LMM1_CORE_2026-02-01';

export type MachineSnapshot = {
  state: MachineState;
  since: string;
  lastEventAt: string;
  activeJob?: string | null;
};

export function initialSnapshot(): MachineSnapshot {
  const now = new Date().toISOString();
  return {
    state: 'IDLE',
    since: now,
    lastEventAt: now,
    activeJob: null,
  };
}