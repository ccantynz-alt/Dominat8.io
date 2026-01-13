// src/app/start/StartClient.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MarketingTemplate, MarketingUseCase } from "../lib/marketingCatalog";

type Props = {
  useCases: MarketingUseCase[];
  templates: MarketingTemplate[];
};

type RegisterResponse =
  | { ok: true; projectId: string; publicUrl?: string }
  | { ok: false; error: string };

export default function StartClient({ useCases, templates }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialUseCase = (searchParams.get("useCase") || "").trim();
  const initialTemplate = (searchParams.get("template") || "").trim();

  const [selectedUseCase, setSelectedUseCase] = React.useState<string>(initialUseCase);
  const [selectedTemplateSlug, setSelectedTemplateSlug] = React.useState<string>(initialTemplate);

  const [name, setName] = React.useState<string>("New Project");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chosenTemplate = React.useMemo(() => {
    return templates.find((t) => t.slug === selectedTemplateSlug) || null;
  }, [templates, selectedTemplateSlug]);

  const computedTemplateId = React.useMemo(() => {
    if (!chosenTemplate) return null;
    return chosenTemplate.templateId || chosenTemplate.slug || null;
  }, [chosenTemplate]);

  function updateUrl(nextUseCase: string, nextTemplate: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (nextUseCase) params.set("useCase", nextUseCase);
    else params.delete("useCase");

    if (nextTemplate) params.set("template", nextTemplate);
    else params.delete("template");

    const qs = params.toString();
    router.replace(qs ? `/start?${qs}` : "/start");
  }

  async function persistTemplateId(projectId: string, templateId: string | null) {
    // Always try, but never block the redirect if this fails.
    try {
      await fetch(`/api/projects/${projectId}/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
    } catch {
      // ignore
    }
  }

  async function onStart() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        name: name || "New Project",
        templateId: computedTemplateId, // still sent to register (nice if backend stores it)
      };

      const res = await fetch("/api/projects/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as RegisterResponse;

      if (!res.ok || !data || data.ok === false) {
        const msg =
          (data && "error" in data && data.error) ||
          `Failed to create project (HTTP ${res.status})`;
        throw new Error(msg);
      }

      // ✅ NEW: store templateId in KV mapping (projectId -> templateId)
      await persistTemplateId(data.projectId, computedTemplateId);

      // ✅ NEW: include templateId as query param too (belt-and-braces)
      const qp = computedTemplateId ? `?templateId=${encodeURIComponent(computedTemplateId)}` : "";
      router.push(`/projects/${data.projectId}${qp}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
        Start your project
      </h1>
      <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 24 }}>
        Pick a use case and a template. We’ll create your project and take you into the builder.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Project name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Project"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.18)",
              outline: "none",
            }}
          />
        </div>

        <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Choose a use case</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {useCases.map((uc) => {
              const active = selectedUseCase === uc.slug;
              return (
                <button
                  key={uc.slug}
                  type="button"
                  onClick={() => {
                    setSelectedUseCase(uc.slug);
                    updateUrl(uc.slug, selectedTemplateSlug);
                  }}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 12,
                    border: active ? "2px solid rgba(0,0,0,0.6)" : "1px solid rgba(0,0,0,0.16)",
                    background: active ? "rgba(0,0,0,0.05)" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{uc.title}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{uc.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Choose a template</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {templates.map((t) => {
              const active = selectedTemplateSlug === t.slug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateSlug(t.slug);
                    updateUrl(selectedUseCase, t.slug);
                  }}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 12,
                    border: active ? "2px solid rgba(0,0,0,0.6)" : "1px solid rgba(0,0,0,0.16)",
                    background: active ? "rgba(0,0,0,0.05)" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{t.description}</div>
                  <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>
                    templateId: {t.templateId || t.slug}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, opacity: 0.8, fontSize: 14 }}>
            Selected templateId to send:{" "}
            <span style={{ fontWeight: 800 }}>
              {computedTemplateId ?? "null"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ color: "rgba(0,0,0,0.75)", fontSize: 14 }}>
            {selectedUseCase ? `Use case: ${selectedUseCase}` : "Pick a use case (optional)."}{" "}
            {selectedTemplateSlug ? `Template: ${selectedTemplateSlug}` : "Pick a template (optional)."}
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.22)",
              background: "black",
              color: "white",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
              minWidth: 160,
            }}
          >
            {loading ? "Creating..." : "Start"}
          </button>
        </div>

        {error ? (
          <div style={{ border: "1px solid rgba(255,0,0,0.3)", background: "rgba(255,0,0,0.06)", padding: 12, borderRadius: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Error</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
