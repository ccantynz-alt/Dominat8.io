"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

/**
 * StartClient
 * Fixes: Next.js types can treat useSearchParams() as possibly null in some setups.
 * We guard with optional chaining so type-check passes on Vercel.
 */
export default function StartClient() {
  const searchParams = useSearchParams();

  const initialUseCase = ((searchParams?.get("useCase")) ?? "").trim();
  const initialTemplate = ((searchParams?.get("template")) ?? "").trim();

  const [selectedUseCase, setSelectedUseCase] = React.useState<string>(initialUseCase);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>(initialTemplate);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Start</h1>
        <p className="text-gray-600 mb-6">
          Choose a use-case and template to begin. (This component is now build-safe on Vercel.)
        </p>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Use case</span>
            <input
              className="border rounded-lg px-3 py-2"
              value={selectedUseCase}
              onChange={(e) => setSelectedUseCase(e.target.value)}
              placeholder="e.g. SaaS, Local Service, Portfolio"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Template</span>
            <input
              className="border rounded-lg px-3 py-2"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              placeholder="e.g. minimal, premium, bold"
            />
          </label>

          <div className="text-sm text-gray-500">
            Query params detected:
            <div className="mt-1 font-mono text-xs bg-gray-50 border rounded-lg p-3 overflow-auto">
              useCase={JSON.stringify(initialUseCase)}{"\n"}
              template={JSON.stringify(initialTemplate)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
