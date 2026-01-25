export const MM_PREFIX = "marketingMachine:";

export function keyPageSpec(slug: string): string {
  return `${MM_PREFIX}page:${slug}:spec`;
}

export function keyPageHtml(slug: string): string {
  return `${MM_PREFIX}page:${slug}:html`;
}

export function keyPageMeta(slug: string): string {
  return `${MM_PREFIX}page:${slug}:meta`;
}

export function keyBulkRun(runId: string): string {
  return `${MM_PREFIX}bulk:${runId}`;
}
/**
 * Compatibility export: store.ts expects Keys.
 * Keep these deterministic; no external deps.
 */
export const Keys = {
  prefix: MM_PREFIX,

  pageSpec: (slug: string) => keyPageSpec(slug),
  pageHtml: (slug: string) => keyPageHtml(slug),
  pageMeta: (slug: string) => keyPageMeta(slug),

  bulkRun: (runId: string) => keyBulkRun(runId),
  // Campaign storage keys (store.ts compatibility)
  campaign: (id: string) => `${MM_PREFIX}campaign:${id}`,
  campaignIndex: () => `${MM_PREFIX}campaign:index`,
};