/**
 * Central key builder for Vercel KV.
 * Exported as both `K` (preferred) and `keys` (back-compat).
 */

export const K = {
  // ─────────────────────────────────────────────
  // Projects
  // ─────────────────────────────────────────────
  projectsIndex: "idx:projects", // zset
  project: (id: string) => `project:${id}`,

  // ─────────────────────────────────────────────
  // Runs
  // ─────────────────────────────────────────────
  runsIndex: (projectId: string) => `idx:runs:${projectId}`, // zset
  run: (runId: string) => `run:${runId}`,

  // List of log lines for a run
  runLogs: (runId: string) => `run:${runId}:logs`, // list

  // Queue of run IDs to process
  queue: "queue:runs", // list

  // Lease key for cron / workers
  lease: (name: string) => `lease:${name}`, // string

  // ─────────────────────────────────────────────
  // Memory
  // ─────────────────────────────────────────────
  memoryIndex: (scope: string, id: string) =>
    `idx:memory:${scope}:${id}`, // zset
  memory: (id: string) => `memory:${id}`,

  // ─────────────────────────────────────────────
  // Agents
  // ─────────────────────────────────────────────
  agentState: "state:agents"
};

/**
 * Back-compat alias.
 * Allows: import { keys } from ".../lib/keys"
 */
export const keys = K;
