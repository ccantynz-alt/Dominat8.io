export const keys = {
  project: (projectId: string) => `project:${projectId}`,
  projectIdsByOwner: (ownerId: string) => `projectIdsByOwner:${ownerId}`,
  projectsIndexByOwner: (ownerId: string) => `projectsIndexByOwner:${ownerId}`,

  run: (runId: string) => `run:${runId}`,
  runIdsByProject: (projectId: string) => `runIdsByProject:${projectId}`,
  runIdsByOwner: (ownerId: string) => `runIdsByOwner:${ownerId}`,

  runLogs: (runId: string) => `runLogs:${runId}`,
};
