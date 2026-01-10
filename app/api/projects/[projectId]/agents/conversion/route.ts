onClick={async () => {
  setBusy(true);
  try {
    const ok = await runConversionAgent();
    if (!ok) return;

    // Load the agent log (chat history)
    const lg = await fetch(`/api/projects/${projectId}/agents/conversion`, { cache: "no-store" });
    const lgText = await lg.text();

    if (lg.ok) {
      try {
        const data = JSON.parse(lgText);
        if (data?.ok && Array.isArray(data?.log)) {
          setToast({
            tone: "success",
            title: "Agent updated your site",
            message:
              "Conversion Agent applied. Open again any time to adjust instructions.",
          });
        }
      } catch {}
    }

    await loadPreview();
    setAudit({ state: "idle" });
    await runAudit();
  } finally {
    setBusy(false);
  }
}}
