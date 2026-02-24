import type { ChangePlan, ChangeStep } from './types';

export type TraceEntry = {
  ts: string;
  planId: string;
  stepId: string;
  status: ChangeStep['status'];
  message?: string;
};

const _trace: TraceEntry[] = [];

export function recordTrace(entry: TraceEntry): void {
  _trace.push(entry);
  if (_trace.length > 500) _trace.splice(0, _trace.length - 500);
}

export function getTrace(planId?: string): TraceEntry[] {
  if (!planId) return [..._trace];
  return _trace.filter(e => e.planId === planId);
}

export function traceStep(plan: ChangePlan, step: ChangeStep, message?: string): void {
  recordTrace({
    ts: new Date().toISOString(),
    planId: plan.id,
    stepId: step.id,
    status: step.status,
    message,
  });
}
