/**
 * Central key builder for Vercel KV.
 * We export both `K` (preferred) and `keys` (back-compat alias).
 */

export const K = {
  projectsIndex: "idx:projects", // zset
  project: (id: string) => `project:${id}`,

  runsIndex: (projectId: string) => `idx:runs:${projectId}`, // zset
  run: (runId: string) => `run:${runId}`,

  queue: "queue:runs", // list
  lease: (name: string) => `lease:${name}`, // string

  memoryIndex: (scope: string, id: string) => `idx:memory:${scope}:${id}`, // zset
  memory: (id: string) => `memory:${id}`,

  agentState: "state:agents"
};

/**
 * Back-compat alias for older code that imports { keys }.
 */
export const keys = K;
