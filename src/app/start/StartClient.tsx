"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

type MarketingTemplate = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
};

type MarketingUseCase = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
};

type StartClientProps = {
  templates: MarketingTemplate[];
  useCases: MarketingUseCase[];
};

export default function StartClient({ templates, useCases }: StartClientProps) {
  const searchParams = useSearchParams();

  const initialUseCase = ((searchParams?.get("useCase")) ?? "").trim();
  const initialTemplate = ((searchParams?.get("template")) ?? "").trim();

  const [selectedUseCase, setSelectedUseCase] = React.useState<string>(initialUseCase);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>(initialTemplate);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Start</h1>
        <p className="text-gray-600 mb-6">Choose a use-case and template to begin.</p>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Use case</span>
            <select
              className="border rounded-lg px-3 py-2 bg-white"
              value={selectedUseCase}
              onChange={(e) => setSelectedUseCase(e.target.value)}
            >
              <option value="">Select a use case…</option>
              {useCases.map((u, i) => {
                const value = (u.slug ?? u.id ?? u.name ?? u.title ?? `usecase-${i}`) as string;
                const label = (u.title ?? u.name ?? u.slug ?? u.id ?? value) as string;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Template</span>
            <select
              className="border rounded-lg px-3 py-2 bg-white"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select a template…</option>
              {templates.map((t, i) => {
                const value = (t.slug ?? t.id ?? t.name ?? t.title ?? `template-${i}`) as string;
                const label = (t.title ?? t.name ?? t.slug ?? t.id ?? value) as string;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="text-xs text-gray-500 font-mono bg-gray-50 border rounded-lg p-3 overflow-auto">
            useCase(param)={JSON.stringify(initialUseCase)}
            {"\n"}
            template(param)={JSON.stringify(initialTemplate)}
          </div>
        </div>
      </div>
    </main>
  );
}
