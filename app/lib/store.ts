// Simulate execution lifecycle (demo)
setTimeout(async () => {
  const running = { ...run, status: "running" };
  await kvJsonSet(runKey(userId, runId), running);

  setTimeout(async () => {
    const complete = {
      ...running,
      status: "complete",
      files: [
        { path: "app/page.tsx", content: "// Generated landing page" },
      ],
    };
    await kvJsonSet(runKey(userId, runId), complete);
  }, 1500);
}, 500);
