/**
 * Machine queue interface (SAFE MODE).
 * Minimal stub to keep builds green.
 */
export type MachineJob = {
  id: string;
  createdAtIso?: string;
  payload?: unknown;
};

export type MachineResult = {
  id: string;
  ok: boolean;
  detail?: unknown;
  finishedAtIso?: string;
};

export async function dequeueSafe(): Promise<MachineJob | null> {
  return null;
}

export async function recordResult(result: MachineResult): Promise<{ ok: true }> {
  void result;
  return { ok: true };
}
