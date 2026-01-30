export const CORE_AUDIT_STAMP = 'ARCH_PHASE_A_2026-01-31';

export interface AuditEntry {
  timestamp: string;
  message: string;
}

export function audit(_: AuditEntry): void {
  // Phase A: no-op
}