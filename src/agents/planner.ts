export const PLANNER_STAMP = 'ARCH_PHASE_B_2026-03-01';

/**
 * Planner — generates an ordered list of agent tasks for complex builds.
 *
 * Phase B: basic planning for multi-agent workflows.
 */

export interface PlanStep {
  agent: string;
  description: string;
  dependsOn?: string[];
}

/**
 * Plan a sequence of agent tasks for a builder request.
 *
 * @param prompt - The user's build prompt
 * @param options - Optional configuration
 * @returns Ordered list of plan steps
 */
export function plan(
  prompt: string,
  options?: { hasHtml?: boolean; model?: string },
): PlanStep[] {
  const steps: PlanStep[] = [];

  if (!options?.hasHtml) {
    // No existing HTML — start with generation
    steps.push({
      agent: "claude-builder",
      description: `Generate website from prompt: "${prompt.slice(0, 80)}"`,
    });
  }

  // Always audit after generation
  steps.push({
    agent: "seo-sweep",
    description: "Run SEO audit on generated HTML",
    dependsOn: options?.hasHtml ? undefined : ["claude-builder"],
  });

  steps.push({
    agent: "responsive-audit",
    description: "Check responsive design across breakpoints",
    dependsOn: options?.hasHtml ? undefined : ["claude-builder"],
  });

  steps.push({
    agent: "accessibility-checker",
    description: "Verify WCAG 2.1 AA compliance",
    dependsOn: options?.hasHtml ? undefined : ["claude-builder"],
  });

  // If issues found, refine
  steps.push({
    agent: "claude-refiner",
    description: "Apply fixes for any issues found by audits",
    dependsOn: ["seo-sweep", "responsive-audit", "accessibility-checker"],
  });

  return steps;
}
