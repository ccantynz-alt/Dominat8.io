export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type RunKind =
  | "agent:plan"
  | "agent:build"
  | "agent:import"
  | "agent:deploy"
  | "agent:maintenance";

export type Run = {
  id: string;
  kind: RunKind;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  title: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
};
