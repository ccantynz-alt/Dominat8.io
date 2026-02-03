/**
 * Heartbeat state contract.
 * Minimal, import-compatible exports used by ./route.ts.
 * No external deps, no side effects.
 */

export type MachineSnapshot = {
  /** ISO string for human readability */
  at: string;
  /** Unix epoch ms for sorting */
  atMs: number;
  /** Build/deploy marker expected by route */
  stamp: string;
  /** Free-form info bag (route may add fields later) */
  meta?: Record<string, unknown>;
};

export const LMM1_STAMP = "LMM1_STAMP_PLACEHOLDER";

export const initialSnapshot: MachineSnapshot = {
  at: new Date(0).toISOString(),
  atMs: 0,
  stamp: LMM1_STAMP,
  meta: { initialized: true }
};