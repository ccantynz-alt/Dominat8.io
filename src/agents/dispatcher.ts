export const DISPATCHER_STAMP = 'ARCH_PHASE_B_2026-02-24';

export type TaskType =
  | 'generate'
  | 'seo'
  | 'creative'
  | 'sitemap'
  | 'patch'
  | 'fix'
  | 'unknown';

export type DispatchRequest = {
  task: string;
  type?: TaskType;
  projectId?: string;
  meta?: Record<string, unknown>;
};

export type DispatchResult = {
  agentId: string;
  taskType: TaskType;
  projectId?: string;
};

export function inferTaskType(task: string): TaskType {
  const t = task.toLowerCase();
  if (/seo|keyword|meta|search|rank/.test(t)) return 'seo';
  if (/design|brand|copy|headline|creative|color|font|style/.test(t)) return 'creative';
  if (/sitemap|structure|pages?|navigation/.test(t)) return 'sitemap';
  if (/\bfix\b|repair|broken/.test(t)) return 'fix';
  if (/patch|bug|error/.test(t)) return 'patch';
  if (/generat|build|creat|new site/.test(t)) return 'generate';
  return 'unknown';
}

const AGENT_MAP: Record<TaskType, string> = {
  generate:  '01_dispatcher',
  seo:       '03_seo',
  creative:  '02_creative_director',
  sitemap:   '04_sitemap',
  patch:     '05_patch_writer',
  fix:       '05_patch_writer',
  unknown:   '01_dispatcher',
};

export function dispatch(req: unknown): DispatchResult | null {
  if (!req || typeof req !== 'object') return null;
  const r = req as Partial<DispatchRequest>;
  if (!r.task || typeof r.task !== 'string') return null;

  const taskType = r.type ?? inferTaskType(r.task);
  const agentId = AGENT_MAP[taskType] ?? '01_dispatcher';

  return {
    agentId,
    taskType,
    ...(r.projectId ? { projectId: r.projectId } : {}),
  };
}