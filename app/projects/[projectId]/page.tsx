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
    // 1) Generate conversion-ready HTML via Level-2 finish endpoint
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

    // 3) Load preview
    setToast({
      tone: "success",
      title: "Site generated",
      message: "Loading preview and running quality check…",
    });

    await loadPreview();

    // 4) Run audit and capture result
    setAudit({ state: "checking" });

    const auditRes = await fetch(`/api/projects/${projectId}/audit`, { method: "POST" });
    const auditText = await auditRes.text();

    if (!auditRes.ok) {
      setAudit({ state: "error", message: `(${auditRes.status}) ${auditText}` });
      setToast({
        tone: "danger",
        title: "Quality check failed",
        message: `(${auditRes.status}) ${auditText}`,
      });
      return;
    }

    let auditData: any = null;
    try {
      auditData = JSON.parse(auditText);
    } catch {
      setAudit({ state: "error", message: `Unexpected response: ${auditText}` });
      setToast({
        tone: "danger",
        title: "Quality check error",
        message: `Unexpected response: ${auditText}`,
      });
      return;
    }

    if (!auditData?.ok) {
      setAudit({ state: "error", message: `Audit error: ${auditText}` });
      setToast({
        tone: "danger",
        title: "Quality check error",
        message: `Audit error: ${auditText}`,
      });
      return;
    }

    const readyToPublish = Boolean(auditData.readyToPublish);
    const missing = Array.isArray(auditData.missing) ? auditData.missing : [];
    const warnings = Array.isArray(auditData.warnings) ? auditData.warnings : [];
    const notes = Array.isArray(auditData.notes) ? auditData.notes : [];

    setAudit({
      state: "ready",
      ok: readyToPublish,
      missing,
      warnings,
      notes,
    });

    // 5) Publish only if audit passes
    if (!readyToPublish) {
      setToast({
        tone: "danger",
        title: "Not published",
        message:
          "Your site generated successfully, but the quality check found issues.\n\nFix the missing items, then click Publish.",
      });
      return;
    }

    setToast({
      tone: "success",
      title: "Quality check passed",
      message: "Publishing now…",
    });

    // publishNow handles 402 upgrade requirement itself
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
