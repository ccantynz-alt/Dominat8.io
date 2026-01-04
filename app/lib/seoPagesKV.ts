/**
 * TEMP STUB:
 * Provide exports expected by SEO routes and site pages.
 */

export async function listSeoPages(_projectId: string) {
  return { ok: true, status: "stub", pages: [] as any[] };
}

export async function getSeoPage(_projectId: string, _slug: string) {
  return { ok: true, status: "stub", page: null as any };
}

export async function getSeoPageBySlug(_projectId: string, _slug: string) {
  return null as any;
}

export async function saveSeoPage(_projectId: string, _slug: string, _data: any) {
  return { ok: false, status: "not_implemented" };
}

export async function deleteSeoPage(_projectId: string, _slug: string) {
  return { ok: false, status: "not_implemented" };
}

