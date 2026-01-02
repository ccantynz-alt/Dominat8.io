await fetch(`/api/projects/${projectId}/runs/${newRun.id}/run`, {
  method: "POST",
});
