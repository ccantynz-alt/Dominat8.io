// app/lib/runFiles.ts
import { kvJsonGet, kvJsonSet } from "./kv";

export type RunFile = {
  path: string;
  content: string;
};

function filesKey(runId: string) {
  return `runs:${runId}:files`;
}

/**
 * Store generated files for a run (placeholder-friendly).
 */
export async function setRunFiles(runId: string, files: RunFile[]) {
  await kvJsonSet(filesKey(runId), files);
}

/**
 * Load generated files for a run. Returns [] if none exist.
 */
export async function getRunFiles(runId: string): Promise<RunFile[]> {
  const v = await kvJsonGet<RunFile[]>(filesKey(runId));
  return Array.isArray(v) ? v : [];
}
