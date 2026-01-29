/**
 * patchRunner.ts (DXL HOTFIX)
 * Purpose: unblock Next.js build when /api/engine/patch-run imports this module.
 *
 * You can wire this later to your real engine patch runner.
 * For now, it returns a safe, explicit "not configured" response payload.
 */

export type PatchRunRequest = {
  projectId?: string;
  patchId?: string;
  patch?: string;
  dryRun?: boolean;
  [k: string]: any;
};

export type PatchRunResult = {
  ok: boolean;
  mode: "stub";
  message: string;
  received?: PatchRunRequest;
};

export async function runPatch(req: PatchRunRequest): Promise<PatchRunResult> {
  return {
    ok: false,
    mode: "stub",
    message:
      "patchRunner is not configured on this deployment. This stub exists to keep builds green. Wire src/lib/engine/patchRunner.ts to your real engine when ready.",
    received: req,
  };
}