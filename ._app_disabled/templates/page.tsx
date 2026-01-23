// app/templates/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { templatesCatalog, type TemplateId } from "@/src/app/lib/templatesCatalog";

export default function TemplatesPage() {
  const router = useRouter();
  const [busyId, setBusyId] = useState<TemplateId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(templatesCatalog.map((t) => t.category));
    return ["All", ...Array.from(set)];
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const visible = useMemo(() => {
    if (selectedCategory === "All") return templatesCatalog;
    return templatesCatalog.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  async function onUseTemplate(templateId: TemplateId) {
    setError(null);
    setBusyId(templateId);

    try {
      const r = await fetch("/api/projects/create-from-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const text = await r.text();
      let j: any = null;
      try { j = JSON.parse(text); } catch {}

      if (!r.ok || !j?.ok) {
        const msg = j?.error || `Request failed (${r.status})`;
        throw new Error(msg);
      }

      const url = j.redirectUrl || `/projects/${j.projectId}`;
      router.push(url);
    } catch (e: any) {
      setError(e?.message || "Failed to create project from template");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Templates</h1>
        <p className="mt-2 text-sm text-gray-600">
          Pick a starter template. We’ll create a new project and seed the first spec.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={[
              "rounded-full border px-3 py-1 text-sm",
              selectedCategory === c
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 text-xs uppercase tracking-wide text-gray-500">
              {t.category}
            </div>
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="mt-1 text-sm text-gray-600">{t.tagline}</div>

            <div className="mt-4">
              <button
                onClick={() => onUseTemplate(t.id)}
                disabled={busyId !== null}
                className={[
                  "w-full rounded-xl px-4 py-2 text-sm font-medium",
                  busyId === t.id
                    ? "bg-gray-300 text-gray-800"
                    : "bg-black text-white hover:bg-gray-900",
                ].join(" ")}
              >
                {busyId === t.id ? "Creating..." : "Use template"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border bg-gray-50 p-5 text-sm text-gray-700">
        <div className="font-medium">What happens next?</div>
        <ul className="mt-2 list-disc pl-5">
          <li>A new project is created</li>
          <li>We seed <code>generated:project:&lt;pid&gt;:latest</code></li>
          <li>You’re redirected to the project page</li>
        </ul>
      </div>
    </div>
  );
}
