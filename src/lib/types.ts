export type Project = {
  id: string;
  name: string;
  repoUrl: string;          // https://github.com/org/repo
  defaultBranch?: string;   // main/master
  createdAt: string;

  // Optional build integration:
  vercelDeployHookUrl?: string; // Vercel Deploy Hook (POST to trigger build)
};

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type Run = {
  id: string;
  projectId: string;
  status: RunStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;

  trigger?: "manual" | "agent" | "auto-update";
  logs: string[]; // stored as array for simplicity
  error?: string;
};

export type MemoryRecord = {
  id: string;
  scope: "project" | "user";
  scopeId: string;
  createdAt: string;
  content: string;
  tags?: string[];
};
