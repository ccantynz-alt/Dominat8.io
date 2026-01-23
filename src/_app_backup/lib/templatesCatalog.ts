// src/app/lib/templatesCatalog.ts

export type TemplateId =
  | "shuttle-service"
  | "local-trades"
  | "restaurant"
  | "saas-landing"
  | "portfolio";

export type TemplateItem = {
  id: TemplateId;
  name: string;
  tagline: string;
  category: "Services" | "Local Business" | "SaaS" | "Portfolio";
  seed: {
    title: string;
    description: string;
    pages: Array<{
      slug: string;
      title: string;
      sections: Array<{
        type: string;
        props: Record<string, any>;
      }>;
    }>;
  };
};

export const templatesCatalog: TemplateItem[] = [
  {
    id: "shuttle-service",
    name: "Shuttle Service",
    tagline: "Bookings-first site for transport & airport runs",
    category: "Services",
    seed: {
      title: "Airport Shuttle Service",
      description:
        "A fast, booking-focused shuttle website with trust signals and clear CTAs.",
      pages: [
        {
          slug: "/",
          title: "Home",
          sections: [
            {
              type: "hero",
              props: {
                headline: "Reliable Airport Shuttles, On Time — Every Time",
                subheadline:
                  "Easy online booking for airport transfers, events, and local rides.",
                primaryCta: { label: "Book a ride", href: "/book" },
                secondaryCta: { label: "View pricing", href: "/pricing" },
              },
            },
            {
              type: "features",
              props: {
                items: [
                  { title: "Fixed pricing", body: "Clear pricing with no surprises." },
                  { title: "Professional drivers", body: "Friendly, vetted, experienced." },
                  { title: "24/7 availability", body: "Early flights? Late arrivals? Covered." },
                ],
              },
            },
            {
              type: "trust",
              props: {
                bullets: [
                  "Flight tracking",
                  "Meet & greet options",
                  "Luggage-friendly vehicles",
                  "Local knowledge",
                ],
              },
            },
          ],
        },
        {
          slug: "/pricing",
          title: "Pricing",
          sections: [
            {
              type: "pricing",
              props: {
                plans: [
                  {
                    name: "Standard",
                    price: "From $69",
                    bullets: ["Airport transfers", "Local rides"],
                  },
                  {
                    name: "Premium",
                    price: "From $99",
                    bullets: ["Meet & greet", "Priority pickup"],
                  },
                ],
              },
            },
          ],
        },
        {
          slug: "/book",
          title: "Book",
          sections: [
            {
              type: "form",
              props: {
                headline: "Request a booking",
                fields: [
                  "Name",
                  "Email",
                  "Phone",
                  "Pickup",
                  "Dropoff",
                  "Date",
                  "Time",
                  "Notes",
                ],
              },
            },
          ],
        },
      ],
    },
  },

  {
    id: "local-trades",
    name: "Local Trades",
    tagline: "Perfect for plumbers, electricians, builders",
    category: "Local Business",
    seed: {
      title: "Local Trades & Repairs",
      description: "A clean local business site with service pages and lead capture.",
      pages: [
        {
          slug: "/",
          title: "Home",
          sections: [
            {
              type: "hero",
              props: {
                headline: "Fast, Friendly, Professional Service",
                subheadline: "Same-week availability. Free quotes. Quality workmanship.",
                primaryCta: { label: "Get a quote", href: "/contact" },
                secondaryCta: { label: "Our services", href: "/services" },
              },
            },
            {
              type: "services",
              props: {
                items: [
                  { title: "Repairs", body: "Fixes done right the first time." },
                  { title: "Installations", body: "Clean installs, compliant and safe." },
                  { title: "Maintenance", body: "Prevent issues with regular checks." },
                ],
              },
            },
          ],
        },
        {
          slug: "/services",
          title: "Services",
          sections: [
            { type: "serviceList", props: { intro: "What we can help with." } },
          ],
        },
        {
          slug: "/contact",
          title: "Contact",
          sections: [{ type: "form", props: { headline: "Request a quote" } }],
        },
      ],
    },
  },

  {
    id: "restaurant",
    name: "Restaurant",
    tagline: "Menu, opening hours, reservations",
    category: "Local Business",
    seed: {
      title: "Modern Restaurant",
      description: "A simple restaurant site with menu highlights and reservation CTA.",
      pages: [
        {
          slug: "/",
          title: "Home",
          sections: [
            {
              type: "hero",
              props: {
                headline: "Seasonal Food. Great Coffee. Warm Atmosphere.",
                subheadline: "Dine in or takeaway. Fresh ingredients, daily specials.",
                primaryCta: { label: "View menu", href: "/menu" },
                secondaryCta: { label: "Reserve a table", href: "/reserve" },
              },
            },
          ],
        },
        { slug: "/menu", title: "Menu", sections: [{ type: "menu", props: {} }] },
        {
          slug: "/reserve",
          title: "Reservations",
          sections: [{ type: "form", props: { headline: "Reserve a table" } }],
        },
      ],
    },
  },

  {
    id: "saas-landing",
    name: "SaaS Landing",
    tagline: "Hero, features, pricing, FAQ — ready to sell",
    category: "SaaS",
    seed: {
      title: "Your SaaS Product",
      description: "A conversion-optimized SaaS landing page.",
      pages: [
        {
          slug: "/",
          title: "Home",
          sections: [
            {
              type: "hero",
              props: {
                headline: "Launch Faster. Convert More. Grow Smarter.",
                subheadline: "A modern landing page built to turn visitors into customers.",
                primaryCta: { label: "Start free", href: "/start" },
                secondaryCta: { label: "See pricing", href: "/pricing" },
              },
            },
            {
              type: "features",
              props: {
                items: [
                  { title: "Fast setup", body: "Get a real site live in minutes." },
                  { title: "SEO-ready", body: "Built for search from day one." },
                  { title: "Conversion-focused", body: "Clear CTAs and trust sections." },
                ],
              },
            },
          ],
        },
        {
          slug: "/pricing",
          title: "Pricing",
          sections: [{ type: "pricing", props: {} }],
        },
        {
          slug: "/start",
          title: "Start",
          sections: [{ type: "form", props: { headline: "Create your account" } }],
        },
      ],
    },
  },

  {
    id: "portfolio",
    name: "Portfolio",
    tagline: "Showcase projects and capture leads",
    category: "Portfolio",
    seed: {
      title: "Creative Portfolio",
      description: "A clean portfolio with projects and a contact form.",
      pages: [
        {
          slug: "/",
          title: "Home",
          sections: [
            {
              type: "hero",
              props: {
                headline: "Hi, I’m Alex — I build beautiful things.",
                subheadline: "Selected work, case studies, and ways to get in touch.",
                primaryCta: { label: "View projects", href: "/projects" },
                secondaryCta: { label: "Contact", href: "/contact" },
              },
            },
          ],
        },
        {
          slug: "/projects",
          title: "Projects",
          sections: [{ type: "gallery", props: {} }],
        },
        {
          slug: "/contact",
          title: "Contact",
          sections: [{ type: "form", props: { headline: "Let’s work together" } }],
        },
      ],
    },
  },
];
