// app/api/templates/templates.ts
export type Template = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "landing-modern",
    name: "Modern Landing Page",
    description: "Hero, features, pricing, FAQ, and contact form.",
    prompt:
      "Build a modern landing page with hero, features, pricing, FAQ, and a contact form. Clean modern styling.",
  },
  {
    id: "business-site",
    name: "Business Website",
    description: "Hero, services, testimonials, about, and contact.",
    prompt:
      "Create a professional business website with hero, services, testimonials, about, and contact. Clean modern styling.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Work grid, case study pages, about, contact.",
    prompt:
      "Create a personal portfolio website with a projects grid, case study pages, about section, and contact form. Minimal modern styling.",
  },
];

export function getTemplateById(id: string) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

