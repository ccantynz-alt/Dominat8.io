/**
 * LMM-1 CLASSIFIER
 * Converts guard check failures into named issue classes (stable strings).
 */
import type { GuardCheck } from './_guard';

export type IssueClass =
  | 'route_missing'
  | 'route_error'
  | 'api_unreachable'
  | 'kv_missing'
  | 'unknown';

export type Classification = {
  classes: IssueClass[];
  summary: string;
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function classifyChecks(checks: GuardCheck[]): Classification {
  const classes: IssueClass[] = [];

  const routeChecks = checks.filter((c) => String(c.name || '').startsWith('route:'));
  const kvChecks    = checks.filter((c) => String(c.name || '').startsWith('kv:'));

  const anyRouteDown = routeChecks.some((c) => !c.ok && (c.status === null || c.status === undefined));
  if (anyRouteDown) classes.push('api_unreachable');

  const missingRoutes = routeChecks.filter((c) => !c.ok && c.status === 404);
  if (missingRoutes.length > 0) classes.push('route_missing');

  const errorRoutes = routeChecks.filter((c) => !c.ok && (c.status !== null && c.status !== undefined) && c.status >= 500);
  if (errorRoutes.length > 0) classes.push('route_error');

  const missingKv = kvChecks.filter((c) => !c.ok);
  if (missingKv.length > 0) classes.push('kv_missing');

  const out = uniq(classes);
  if (out.length === 0) out.push('unknown');

  const summary = out.join(',');

  return { classes: out, summary };
}