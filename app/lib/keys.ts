// app/lib/keys.ts
export const keys = {
  // Runs
  run: (runId: string) => `run:${runId}`,
  runLogs: (runId: string) => `run:${runId}:logs`,

  // Projects
  project: (projectId: string) => `project:${projectId}`,
  projectRuns: (projectId: string) => `project:${projectId}:runs`,

  // Indexes
  projectsIndex: () => `projects`,
};
