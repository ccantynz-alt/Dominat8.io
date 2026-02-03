Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string] $ExpectedRemoteHint = "Dominat8.io"
)

function Ok($m){ Write-Host "✅ $m" -ForegroundColor Green }
function Warn($m){ Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Info($m){ Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Bad($m){ throw "❌ $m" }

function Ensure-Dir($p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Backup-File($p){
  if (Test-Path -LiteralPath $p) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $p -Destination ($p + ".bak_" + $ts) -Force
  }
}
function Write-Utf8NoBom($path, $content){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

if (-not (Test-Path -LiteralPath ".\.git")) { Bad "Not a git repo. CD into Dominat8.io repo root." }
$remote = (git remote -v | Out-String)
if ($remote -notmatch [regex]::Escape($ExpectedRemoteHint)) {
  Write-Host $remote
  Bad "Safety stop: remotes do not contain '$ExpectedRemoteHint'."
}

$libDir = "src\lib\agents"
$apiDir = "src\app\api\agents"
Ensure-Dir $libDir
Ensure-Dir $apiDir

# types.ts
$types = Join-Path $libDir "types.ts"
Backup-File $types
Write-Utf8NoBom $types @"
/** Agent Core v0 (server-only). */

export type AgentId =
  | "dispatcher"
  | "api_engineer"
  | "db_engineer"
  | "ui_engineer"
  | "seo_engineer"
  | "qa_engineer"
  | "devops_engineer"
  | "security_engineer"
  | "product_manager";

export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export type AgentDefinition = {
  id: AgentId;
  label: string;
  capabilities: string[];
};

export type AgentJob = {
  id: string;
  createdAt: number;
  updatedAt: number;
  agentId: AgentId;
  status: JobStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
};

export type JobLogLine = {
  at: number;
  level: "info" | "warn" | "error";
  message: string;
};
"@

# registry.ts
$reg = Join-Path $libDir "registry.ts"
Backup-File $reg
Write-Utf8NoBom $reg @"
import type { AgentDefinition, AgentId } from "./types";

export const AGENTS: AgentDefinition[] = [
  { id: "dispatcher", label: "Dispatcher", capabilities: ["plan","analyze"] },
  { id: "api_engineer", label: "API Engineer", capabilities: ["analyze","patch","check"] },
  { id: "db_engineer", label: "DB Engineer", capabilities: ["analyze","patch","check"] },
  { id: "ui_engineer", label: "UI Engineer", capabilities: ["analyze","patch","check"] },
  { id: "seo_engineer", label: "SEO Engineer", capabilities: ["analyze","patch","check"] },
  { id: "qa_engineer", label: "QA Engineer", capabilities: ["test","verify"] },
  { id: "devops_engineer", label: "DevOps Engineer", capabilities: ["deploy","verify"] },
  { id: "security_engineer", label: "Security Engineer", capabilities: ["review","check"] },
  { id: "product_manager", label: "Product Manager", capabilities: ["spec","plan"] }
];

export function getAgent(id: AgentId) {
  return AGENTS.find(a => a.id === id);
}
"@

# auth.ts (optional API key: D8_AGENT_API_KEY)
$auth = Join-Path $libDir "auth.ts"
Backup-File $auth
Write-Utf8NoBom $auth @"
import { NextRequest } from "next/server";

export function requireAgentKey(req: NextRequest): string | null {
  const required = process.env.D8_AGENT_API_KEY;
  if (!required) return null; // disabled if not set
  const got = req.headers.get("x-d8-agent-key");
  if (!got || got !== required) return "Unauthorized";
  return null;
}
"@

# store.ts (in-memory v0)
$store = Join-Path $libDir "store.ts"
Backup-File $store
Write-Utf8NoBom $store @"
import type { AgentJob, JobLogLine, JobStatus } from "./types";

const jobs = new Map<string, AgentJob>();
const logs = new Map<string, JobLogLine[]>();

function now(){ return Date.now(); }

export function createJob(agentId: AgentJob["agentId"], input: AgentJob["input"]): AgentJob {
  const id = "job_" + Math.random().toString(36).slice(2) + "_" + now();
  const job: AgentJob = { id, createdAt: now(), updatedAt: now(), agentId, status: "queued", input };
  jobs.set(id, job);
  logs.set(id, []);
  appendLog(id, "info", "Job created");
  return job;
}

export function getJob(id: string){ return jobs.get(id); }
export function listJobs(){ return Array.from(jobs.values()).sort((a,b) => b.createdAt - a.createdAt); }

export function setStatus(id: string, status: JobStatus, patch?: Partial<AgentJob>){
  const job = jobs.get(id); if (!job) return;
  job.status = status; job.updatedAt = now();
  if (patch) Object.assign(job, patch);
  jobs.set(id, job);
  appendLog(id, "info", "Status: " + status);
}

export function appendLog(id: string, level: JobLogLine["level"], message: string){
  const arr = logs.get(id) ?? [];
  arr.push({ at: now(), level, message });
  logs.set(id, arr);
}

export function getLogs(id: string){ return logs.get(id) ?? []; }
"@

# runner.ts (safe allow-list only)
$runner = Join-Path $libDir "runner.ts"
Backup-File $runner
Write-Utf8NoBom $runner @"
import { appendLog, getJob, setStatus } from "./store";

type AllowedAction = "ping" | "noop" | "echo";

export async function runJob(jobId: string){
  const job = getJob(jobId);
  if (!job) return;

  setStatus(jobId, "running");
  try {
    const action = String(job.input?.action ?? "noop") as AllowedAction;
    if (!["ping","noop","echo"].includes(action)) throw new Error("Action not allowed: " + action);

    appendLog(jobId, "info", "Running action: " + action);

    if (action === "ping") {
      setStatus(jobId, "succeeded", { output: { ok: true, agentId: job.agentId, at: Date.now() } });
      return;
    }
    if (action === "echo") {
      setStatus(jobId, "succeeded", { output: { ok: true, agentId: job.agentId, echo: job.input } });
      return;
    }
    setStatus(jobId, "succeeded", { output: { ok: true, agentId: job.agentId } });
  } catch (e: any) {
    appendLog(jobId, "error", e?.message ?? "Unknown error");
    setStatus(jobId, "failed", { error: e?.message ?? "Unknown error" });
  }
}
"@

# API routes
Ensure-Dir (Join-Path $apiDir "ping")
Ensure-Dir (Join-Path $apiDir "jobs\create")
Ensure-Dir (Join-Path $apiDir "jobs\list")
Ensure-Dir (Join-Path $apiDir "jobs\[id]")
Ensure-Dir (Join-Path $apiDir "jobs\[id]\logs")

$ping = Join-Path $apiDir "ping\route.ts"
Backup-File $ping
Write-Utf8NoBom $ping @"
import { NextResponse } from "next/server";
export async function GET(){ return NextResponse.json({ ok:true, service:"agents", version:"v0", at: Date.now() }); }
"@

$list = Join-Path $apiDir "jobs\list\route.ts"
Backup-File $list
Write-Utf8NoBom $list @"
import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/agents/auth";
import { listJobs } from "@/lib/agents/store";

export async function GET(req: NextRequest){
  const err = requireAgentKey(req);
  if (err) return NextResponse.json({ ok:false, error: err }, { status: 401 });
  return NextResponse.json({ ok:true, jobs: listJobs() });
}
"@

$create = Join-Path $apiDir "jobs\create\route.ts"
Backup-File $create
Write-Utf8NoBom $create @"
import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/agents/auth";
import { createJob } from "@/lib/agents/store";
import { runJob } from "@/lib/agents/runner";

export async function POST(req: NextRequest){
  const err = requireAgentKey(req);
  if (err) return NextResponse.json({ ok:false, error: err }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const agentId = body?.agentId ?? "dispatcher";
  const input = body?.input ?? { action: "noop" };

  const job = createJob(agentId, input);
  runJob(job.id); // v0: fire-and-forget

  return NextResponse.json({ ok:true, jobId: job.id, job });
}
"@

$jobGet = Join-Path $apiDir "jobs\[id]\route.ts"
Backup-File $jobGet
Write-Utf8NoBom $jobGet @"
import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/agents/auth";
import { getJob } from "@/lib/agents/store";

export async function GET(req: NextRequest, ctx: { params: { id: string } }){
  const err = requireAgentKey(req);
  if (err) return NextResponse.json({ ok:false, error: err }, { status: 401 });

  const job = getJob(ctx.params.id);
  if (!job) return NextResponse.json({ ok:false, error:"Not found" }, { status: 404 });
  return NextResponse.json({ ok:true, job });
}
"@

$jobLogs = Join-Path $apiDir "jobs\[id]\logs\route.ts"
Backup-File $jobLogs
Write-Utf8NoBom $jobLogs @"
import { NextRequest, NextResponse } from "next/server";
import { requireAgentKey } from "@/lib/agents/auth";
import { getLogs } from "@/lib/agents/store";

export async function GET(req: NextRequest, ctx: { params: { id: string } }){
  const err = requireAgentKey(req);
  if (err) return NextResponse.json({ ok:false, error: err }, { status: 401 });
  return NextResponse.json({ ok:true, logs: getLogs(ctx.params.id) });
}
"@

Ok "Agent Core v0 installed (server-only)."
Ok "Next: npm run build, then commit + push."