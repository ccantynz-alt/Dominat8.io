export const CORE_CONTRACTS_STAMP = 'ARCH_PHASE_A_2026-01-31';

export type AgentAction =
  | 'ANALYZE'
  | 'PLAN'
  | 'DRAFT'
  | 'PREVIEW'
  | 'EXECUTE';

export interface AgentContract {
  agentId: string;
  allowedActions: AgentAction[];
}