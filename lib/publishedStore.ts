// lib/publishedStore.ts
// Minimal server-side storage for published HTML.
// Works for MVP/testing. (In-memory per server instance.)

type PublishedRecord = { html: string; updatedAt: number };

function getStore(): Map<string, PublishedRecord> {
  const g = globalThis as any;
  if (!g.__PUBLISHED_STORE__) {
    g.__PUBLISHED_STORE__ = new Map<string, PublishedRecord>();
  }
  return g.__PUBLISHED_STORE__ as Map<string, PublishedRecord>;
}

export function savePublishedHtml(projectId: string, html: string) {
  const store = getStore();
  store.set(projectId, { html, updatedAt: Date.now() });
}

export function getPublishedHtml(projectId: string): PublishedRecord | null {
  const store = getStore();
  return store.get(projectId) || null;
}
