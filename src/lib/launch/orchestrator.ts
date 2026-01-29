/* eslint-disable @typescript-eslint/no-explicit-any */
import { kvGet, kvSet, proofEnvelope } from "./store";
export type AplRunMode = "plan" | "apply";
export type AplRunRequest = { projectId?: string; mode?: AplRunMode; goal?: string; };
export type AplPlanStep = { id: string; title: string; kind: "check" | "generate" | "patch" | "publish"; safe: boolean; notes?: string; };
export type AplRunResult = { runId: string; projectId: string; mode: AplRunMode; plan: AplPlanStep[]; outputs: { demo?: any; video?: any; }; proofKey: string; };

function nowId(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function safeProjectId(pid?: string) { const p = (pid || "demo").trim(); return p.length ? p : "demo"; }

export async function buildPlan(input: AplRunRequest): Promise<AplPlanStep[]> {
  const goal = (input.goal || "Launch Dominat8 demo").trim();
  return [
    { id: "check_env", title: "Check environment + KV access", kind: "check", safe: true, notes: "Reads env only" },
    { id: "check_routes", title: "Check key routes respond (probe/where)", kind: "check", safe: true, notes: "No writes" },
    { id: "gen_demo", title: "Generate demo launch assets (no UI changes)", kind: "generate", safe: true, notes: "Stores JSON artifacts only" },
    { id: "gen_video", title: "Generate 60–90s launch video script + captions", kind: "generate", safe: true, notes: "Stores JSON artifacts only" },
    { id: "patch_optional", title: "Prepare patch bundle (preview-only in V1)", kind: "patch", safe: true, notes: "APL-1 V1 does not apply code changes automatically" },
    { id: "publish_blocked", title: "Publish to production (blocked by design)", kind: "publish", safe: false, notes: "Phase-1 rules: no production publish from cockpit" },
    { id: "proof", title: "Write proof + timeline", kind: "generate", safe: true, notes: `Goal: ${goal}` },
  ];
}

export async function generateDemoArtifacts(projectId: string) {
  return { projectId, pages: ["/ (homepage)","/pricing","/templates","/features","/seo (generated landing page stub)"] };
}

export async function generateVideoArtifacts(goal: string) {
  const title = "Dominat8 — Auto-Pilot Launch Mode";
  const durationSec = 75;
  const script =
`[0–5s] Hook
Build and launch a premium website in minutes — without doing the work yourself.

[5–20s] What Dominat8 is
Dominat8 is an AI website builder that can generate, refine, and launch a site — plus SEO — on auto-pilot.

[20–45s] Auto-Pilot Launch Mode
Press one button:
• It checks the system
• Generates launch assets
• Produces a release plan
• Leaves proof so you can trust the changes

[45–65s] What you get
A homepage, pricing, features, and SEO-ready content — ready to publish.

[65–75s] CTA
Try Dominat8. Turn your idea into a launch — fast.`;
  const captions = ["Build & launch in minutes.","AI website builder + SEO.","Auto-Pilot Launch Mode.","Checks. Generates. Proves.","Ready to publish.","Try Dominat8 today."];
  return { title, durationSec, script, captions, goal };
}

export async function runApl(input: AplRunRequest): Promise<AplRunResult> {
  const mode: AplRunMode = (input.mode || "plan") as AplRunMode;
  const projectId = safeProjectId(input.projectId);
  const goal = (input.goal || "Launch Dominat8 demo").trim();
  const runId = nowId("apl");
  const proofKey = `apl:proof:${runId}`;
  const plan = await buildPlan(input);
  const demo = await generateDemoArtifacts(projectId);
  const video = await generateVideoArtifacts(goal);
  const proof = proofEnvelope("apl_run", { runId, projectId, mode, goal, plan, outputs: { demo, video } });
  await kvSet(proofKey, proof);
  await kvSet("apl:proof:latest", proof);
  await kvSet("apl:status:latest", { ok: true, runId, projectId, mode, goal, proofKey, at: new Date().toISOString() });
  return { runId, projectId, mode, plan, outputs: { demo, video }, proofKey };
}

export async function getLatestStatus() { return (await kvGet("apl:status:latest")) || { ok: false, reason: "No status yet" }; }
export async function getLatestProof() { return (await kvGet("apl:proof:latest")) || { ok: false, reason: "No proof yet" }; }
export async function getProofByRunId(runId: string) { const key = `apl:proof:${runId}`; return (await kvGet(key)) || { ok: false, reason: "No proof for runId", runId, key }; }