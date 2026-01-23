// src/app/lib/templateScaffolds.ts

export type TemplateScaffoldSection = {
  id: string;
  type: "hero" | "features" | "pricing" | "faq" | "testimonials" | "cta" | "about" | "contact";
  heading?: string;
  subheading?: string;
  items?: string[];
};

export type TemplateScaffold = {
  version: 1;
  templateId: string;
  createdAt: string; // ISO
  sections: TemplateScaffoldSection[];
};

/**
 * V1 scaffolds: simple, deterministic starter structure.
 * Later: swap these for richer blocks + AI fill.
 */
export function buildScaffoldForTemplate(templateId: string): TemplateScaffold {
  const now = new Date().toISOString();

  // Normalize
  const tid = (templateId || "").trim().toLowerCase();

  if (tid === "saas") {
    return {
      version: 1,
      templateId: "saas",
      createdAt: now,
      sections: [
        { id: "hero", type: "hero", heading: "Build faster. Launch sooner.", subheading: "A modern SaaS template built to convert." },
        { id: "features", type: "features", heading: "Features", items: ["Fast setup", "Responsive layout", "Conversion-first sections"] },
        { id: "pricing", type: "pricing", heading: "Pricing", items: ["Free", "Pro", "Business"] },
        { id: "faq", type: "faq", heading: "FAQ", items: ["What do I get?", "Can I cancel anytime?", "Do you offer support?"] },
        { id: "cta", type: "cta", heading: "Start building today", subheading: "Create your site in minutes." },
      ],
    };
  }

  if (tid === "startup") {
    return {
      version: 1,
      templateId: "startup",
      createdAt: now,
      sections: [
        { id: "hero", type: "hero", heading: "Tell your story. Win attention.", subheading: "A clean startup landing structure." },
        { id: "about", type: "about", heading: "Why we exist", subheading: "One clear mission statement, no fluff." },
        { id: "features", type: "features", heading: "What you get", items: ["Clear value prop", "Simple section flow", "Strong CTA"] },
        { id: "testimonials", type: "testimonials", heading: "Proof", items: ["Testimonial 1", "Testimonial 2", "Testimonial 3"] },
        { id: "cta", type: "cta", heading: "Join the early access", subheading: "Get started now." },
      ],
    };
  }

  if (tid === "service") {
    return {
      version: 1,
      templateId: "service",
      createdAt: now,
      sections: [
        { id: "hero", type: "hero", heading: "Professional services, done right.", subheading: "Trust-first layout with a clear call to action." },
        { id: "features", type: "features", heading: "What we do", items: ["Service A", "Service B", "Service C"] },
        { id: "testimonials", type: "testimonials", heading: "Trusted by clients", items: ["Client quote 1", "Client quote 2"] },
        { id: "faq", type: "faq", heading: "Common questions", items: ["How does it work?", "What does it cost?", "When can we start?"] },
        { id: "contact", type: "contact", heading: "Contact", subheading: "Let’s get you live." },
      ],
    };
  }

  if (tid === "portfolio") {
    return {
      version: 1,
      templateId: "portfolio",
      createdAt: now,
      sections: [
        { id: "hero", type: "hero", heading: "Hi — I build great work.", subheading: "A clean portfolio structure." },
        { id: "features", type: "features", heading: "Highlights", items: ["Project 1", "Project 2", "Project 3"] },
        { id: "about", type: "about", heading: "About", subheading: "Short bio + focus areas." },
        { id: "testimonials", type: "testimonials", heading: "Feedback", items: ["Quote 1", "Quote 2"] },
        { id: "contact", type: "contact", heading: "Contact", subheading: "Reach out to collaborate." },
      ],
    };
  }

  // Default fallback scaffold
  return {
    version: 1,
    templateId: tid || "default",
    createdAt: now,
    sections: [
      { id: "hero", type: "hero", heading: "Welcome", subheading: "Template scaffold initialized." },
      { id: "features", type: "features", heading: "Sections", items: ["Hero", "Features", "CTA"] },
      { id: "cta", type: "cta", heading: "Next step", subheading: "Wire this scaffold into your builder renderer." },
    ],
  };
}
