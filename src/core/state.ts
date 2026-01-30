export const CORE_STATE_STAMP = 'ARCH_PHASE_A_2026-01-31';

export interface CoreState {
  projectId: string;
  status: 'idle' | 'planned' | 'executing';
}

export function getInitialState(projectId: string): CoreState {
  return { projectId, status: 'idle' };
}