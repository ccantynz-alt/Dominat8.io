import { kv } from '@/src/lib/kv';

const MARKER = "CANON_finishForMe_v1_2026-01-19";

type Step = {
  step: string;
  ok: boolean;
  status: number;
  message?: string;
};

function specKey(projectId: string) {
  return `project:${projectId}:spec`;
}

function minimalDraftSpec(projectId: string) {
  return {
    ok: true,
    marker: MARKER,
    projectId,
    createdAtIso: new Date().toISOString(),
    name: "Draft Site",
    templateId: null,
    pages: [
      {
        slug: "/",
        title: "Home",
        sections: [{ type: "hero", headline: "Welcome", subheadline: "Draft site" }],
      },
    ],
  };
}

export async function runFinishForMe(projectId: string) {
  const steps: Step[] = [];

  const key = specKey(projectId);

  // kv.get() in this repo does not accept generic type params
  // and values are stored as strings
  const existing = await kv.get(key);

  if (existing) {
    steps.push({ step: "seed-spec", ok: true, status: 200, message: "Spec already exists" });
  } else {
    // kv.set expects a string in this repo, so store JSON
    await kv.set(key, JSON.stringify(minimalDraftSpec(projectId)));
    steps.push({ step: "seed-spec", ok: true, status: 200, message: "Draft spec created in KV" });
  }

  steps.push({ step: "finish-for-me", ok: true, status: 200, message: "Finish-for-me KV shim complete" });

  return {
    ok: true as const,
    marker: MARKER,
    projectId,
    nowIso: new Date().toISOString(),
    steps,
  };
}

