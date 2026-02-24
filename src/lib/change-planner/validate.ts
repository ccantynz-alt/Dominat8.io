import type { ChangePlan, ChangeStep } from './types';

export function validatePlan(plan: unknown): plan is ChangePlan {
  if (!plan || typeof plan !== 'object') return false;
  const p = plan as Record<string, unknown>;
  if (typeof p.id !== 'string') return false;
  if (typeof p.description !== 'string') return false;
  if (!Array.isArray(p.steps)) return false;
  return p.steps.every(validateStep);
}

export function validateStep(step: unknown): step is ChangeStep {
  if (!step || typeof step !== 'object') return false;
  const s = step as Record<string, unknown>;
  if (typeof s.id !== 'string') return false;
  if (typeof s.order !== 'number') return false;
  if (!['add', 'edit', 'delete', 'rename', 'move'].includes(s.kind as string)) return false;
  if (typeof s.path !== 'string') return false;
  if (typeof s.description !== 'string') return false;
  if (!['pending', 'applied', 'skipped', 'failed'].includes(s.status as string)) return false;
  return true;
}
