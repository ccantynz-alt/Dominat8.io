import { inferTaskType, TaskType } from './dispatcher';

export const PLANNER_STAMP = 'ARCH_PHASE_B_2026-02-24';

export type PlanRequest = {
  task: string;
  type?: TaskType;
  bundle?: string;
  projectId?: string;
};

export type PlanStep = {
  order: number;
  agentId: string;
  label: string;
  reason: string;
};

// Predefined sequences for common task bundles
const BUNDLE_PLANS: Record<string, PlanStep[]> = {
  bundle_marketing_machine_v1: [
    { order: 1, agentId: '01_dispatcher',       label: 'Dispatch',         reason: 'Validate system and route task.' },
    { order: 2, agentId: '02_creative_director', label: 'Creative Brief',   reason: 'Define copy angles, brand, headlines.' },
    { order: 3, agentId: '03_seo',               label: 'SEO Plan',         reason: 'Research keywords, meta, schema.' },
    { order: 4, agentId: '04_sitemap',            label: 'Sitemap',          reason: 'Propose site structure and pages.' },
    { order: 5, agentId: '05_patch_writer',       label: 'Patch Pack',       reason: 'Produce a deployable patch bundle.' },
  ],
};

// Per-task-type default plans
const TYPE_PLANS: Record<TaskType, PlanStep[]> = {
  generate: [
    { order: 1, agentId: '01_dispatcher',        label: 'Dispatch',         reason: 'Validate and route.' },
    { order: 2, agentId: '02_creative_director', label: 'Creative Brief',   reason: 'Brand, copy, design direction.' },
    { order: 3, agentId: '03_seo',               label: 'SEO Plan',         reason: 'Keywords and metadata.' },
  ],
  seo: [
    { order: 1, agentId: '03_seo',  label: 'SEO Audit',  reason: 'Keyword research, meta, schema.' },
    { order: 2, agentId: '04_sitemap', label: 'Sitemap', reason: 'Index all pages for search.' },
  ],
  creative: [
    { order: 1, agentId: '02_creative_director', label: 'Creative Direction', reason: 'Copy angles, brand, typography.' },
  ],
  sitemap: [
    { order: 1, agentId: '04_sitemap', label: 'Sitemap Plan', reason: 'Structure, navigation, pages.' },
  ],
  patch: [
    { order: 1, agentId: '05_patch_writer', label: 'Patch Pack', reason: 'Write and apply patch.' },
  ],
  fix: [
    { order: 1, agentId: '05_patch_writer', label: 'Fix Pack', reason: 'Diagnose and patch the issue.' },
  ],
  unknown: [
    { order: 1, agentId: '01_dispatcher', label: 'Dispatch', reason: 'Route to the best agent.' },
  ],
};

export function plan(req: unknown): PlanStep[] {
  if (!req || typeof req !== 'object') return [];
  const r = req as Partial<PlanRequest>;

  // Named bundle takes priority
  if (r.bundle && BUNDLE_PLANS[r.bundle]) {
    return BUNDLE_PLANS[r.bundle];
  }

  const task = r.task ?? '';
  const taskType = r.type ?? (typeof task === 'string' ? inferTaskType(task) : 'unknown');
  return TYPE_PLANS[taskType] ?? TYPE_PLANS.unknown;
}