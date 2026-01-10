async function finishForMe() {
  if (!projectId) return;

  const businessName = bizName.trim();
  const niche = bizNiche.trim();
  const location = bizLocation.trim();
  const phone = bizPhone.trim();
  const email = bizEmail.trim();
  const tagline = bizTagline.trim();

  if (!businessName || !niche) {
    setToast({
      tone: "danger",
      title: "Finish for me",
      message: "Please fill Business name and Niche (required).",
    });
    return;
  }

  setBusy(true);
  setToast(null);

  try {
    // 1) Call Level-2 finish endpoint (conversion-ready, automation-first)
    const res = await fetch(`/api/projects/${projectId}/finish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessName,
        niche,
        location,
        phone,
        email,
        tagline,
        tone: "premium",
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      setToast({
        tone: "danger",
        title: "Finish failed",
        message: `(${res.status}) ${text}`,
      });
      return;
    }

    // 2) Close modal
    setModal({ open: false });

    // 3) Load preview immediately
    setToast({
      tone: "success",
      title: "Site generated",
      message: "Loading preview and running quality check…",
    });

    await loadPreview();

    // 4) Run quality audit
    setAudit({ state: "idle" });
    await runAudit();

    // 5) OPTIONAL: auto-publish if Pro
    // publishNow() already handles 402 Upgrade Required and shows link
    await publishNow();
  } catch (err: any) {
    setToast({
      tone: "danger",
      title: "Finish error",
      message: err?.message ? String(err.message) : "Unknown error during Finish for me.",
    });
  } finally {
    setBusy(false);
  }
}
