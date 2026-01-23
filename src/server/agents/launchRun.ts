import { kv } from '@/src/lib/kv';
import { runFinishForMe } from "./finishForMe";

const MARKER = "CANON_launchRun_v1_2026-01-19";

function asNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function makeJobId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `launch_${Date.now()}_${rand}`;
}

type StepRecord = {
  step: string;
  ok: boolean;
  status: number;
  ms?: number;
  contentType?: string;
  bodyFirst200?: string;
  url?: string;
};

type JobRecord = {
  ok: true;
  marker: string;
  jobId: string;
  projectId: string;
  createdAtIso: string;
  finishedAtIso?: string;
  status: "running" | "failed" | "complete";
  steps: StepRecord[];
  config: {
    timeoutMs: number;
    targetCount: number;
    chunkSize: number;
    runFinishForMe: boolean;
    runConversion: boolean;
    runSeoV2: boolean;
    runSitemap: boolean;
    runPublish: boolean;
  };
};

export async function runLaunchRun(projectId: string, query: any) {
  const timeoutMs = asNumber(query?.timeoutMs, 20000);
  const targetCount = asNumber(query?.targetCount, 5000);
  const chunkSize = asNumber(query?.chunkSize, 500);

  const runFinishForMeFlag = true;
  const runConversion = false; // âœ… proof bit
  const runSeoV2 = true;
  const runSitemap = true;
  const runPublish = true;

  const jobId = makeJobId();
  const nowIso = new Date().toISOString();

  const jobKey = `job:${jobId}`;
  const lastJobKey = `project:${projectId}:pipeline:lastJobId`;

  const job: JobRecord = {
    ok: true,
    marker: MARKER,
    jobId,
    projectId,
    createdAtIso: nowIso,
    status: "running",
    steps: [],
    config: {
      timeoutMs,
      targetCount,
      chunkSize,
      runFinishForMe: runFinishForMeFlag,
      runConversion,
      runSeoV2,
      runSitemap,
      runPublish,
    },
  };

  // kv.set expects string values in this repo, so store JSON
  await kv.set(jobKey, JSON.stringify(job));
  await kv.set(lastJobKey, jobId);

  async function persist() {
    await kv.set(jobKey, JSON.stringify(job));
  }

  try {
    if (runFinishForMeFlag) {
      const started = Date.now();
      const out = await runFinishForMe(projectId);
      job.steps.push({
        step: "finish-for-me",
        ok: true,
        status: 200,
        ms: Date.now() - started,
        contentType: "application/json",
        bodyFirst200: JSON.stringify(out).slice(0, 200),
      });
      await persist();
    }

    job.status = "complete";
    job.finishedAtIso = new Date().toISOString();
    await persist();
    return job;
  } catch (e: any) {
    job.status = "failed";
    job.finishedAtIso = new Date().toISOString();
    job.steps.push({
      step: "launch-run",
      ok: false,
      status: 500,
      contentType: "application/json",
      bodyFirst200: (e?.message || "Unknown error").slice(0, 200),
    });
    await persist();
    return job;
  }
}

