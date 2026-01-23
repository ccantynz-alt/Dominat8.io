// pages/api/projects/[projectId]/agents/seo-v2.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { kvJsonSet } from '@/src/lib/kv';

type Changefreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type SeoPage = {
  path: string; // must start with /
  title: string;
  description?: string;
  priority?: number; // 0.0 - 1.0
  changefreq?: Changefreq;
};

type SeoPlanIndex = {
  ok: true;
  version: "seoPlan-v3-chunked";
  projectId: string;
  generatedAtIso: string;
  baseUrl: string;
  totals: {
    pages: number;
    chunks: number;
    chunkSize: number;
  };
  chunkKeys: string[];
  // Optional diagnostics
  samplePaths: string[];
};

function getProto(req: NextApiRequest): string {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  return proto.split(",")[0].trim();
}

function getHost(req: NextApiRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "";
  return String(host).split(",")[0].trim().toLowerCase();
}

function safeBaseUrl(req: NextApiRequest): string {
  const host = getHost(req);
  const proto = getProto(req);
  if (!host) return "https://example.com";
  return `${proto}://${host}`;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// --- PROGRAMMATIC CATALOG (EDIT LATER)
// Keep deterministic. Multi-thousand comes from combining these lists.
const USE_CASES = [
  "SaaS product launch",
  "Local service business",
  "Restaurant website",
  "E-commerce store",
  "Portfolio",
  "Real estate agent",
  "Gym / fitness studio",
  "Consultant",
  "Recruitment agency",
  "Law firm",
  "Dental clinic",
  "Plumber",
  "Electrician",
  "Builder",
  "Cleaning service",
  "Landscaper",
  "Photographer",
  "Wedding venue",
  "Event planner",
  "Mechanic",
  "Beauty salon",
  "Barber",
  "Yoga studio",
  "Accounting firm",
  "Non-profit fundraising",
  "Course creator",
  "App waitlist",
  "AI startup landing page",
  "Agency lead gen",
  "Property management",
];

const INDUSTRIES = [
  "Construction",
  "Health",
  "Fitness",
  "Hospitality",
  "Trades",
  "Professional services",
  "Education",
  "Real estate",
  "Automotive",
  "Beauty",
  "Technology",
  "Finance",
  "Legal",
  "Events",
  "Non-profit",
];

const CITIES = [
  "Auckland",
  "Wellington",
  "Christchurch",
  "Hamilton",
  "Tauranga",
  "Dunedin",
  "Queenstown",
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "San Francisco",
  "New York",
  "London",
];

const SERVICES = [
  "Web design",
  "Website builder",
  "Landing page",
  "SEO services",
  "Local SEO",
  "Lead generation",
  "Conversion optimization",
  "Online bookings",
  "Online ordering",
  "Payments",
];

function buildPages(baseUrl: string, targetCount: number): SeoPage[] {
  const core: SeoPage[] = [
    { path: "/", title: "AI Website Builder", description: "Generate and publish a website in minutes.", priority: 1.0, changefreq: "weekly" },
    { path: "/pricing", title: "Pricing", description: "Simple plans that scale with you.", priority: 0.9, changefreq: "monthly" },
    { path: "/features", title: "Features", description: "Everything you need to launch fast.", priority: 0.9, changefreq: "monthly" },
    { path: "/templates", title: "Templates", description: "Start from proven layouts.", priority: 0.8, changefreq: "weekly" },
    { path: "/use-cases", title: "Use cases", description: "Websites for every business type.", priority: 0.8, changefreq: "weekly" },
  ];

  const pages: SeoPage[] = [...core];

  // Use-cases (dozens â†’ hundreds)
  for (const name of USE_CASES) {
    const slug = slugify(name);
    pages.push({
      path: `/use-cases/${slug}`,
      title: `${name} website`,
      description: `Generate a high-converting ${name.toLowerCase()} website with AI.`,
      priority: 0.7,
      changefreq: "monthly",
    });
  }

  // Industries
  for (const industry of INDUSTRIES) {
    const slug = slugify(industry);
    pages.push({
      path: `/industries/${slug}`,
      title: `${industry} website templates`,
      description: `Templates and copy for ${industry.toLowerCase()} businesses.`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  // â€œLocation Ã— Serviceâ€ programmatic SEO (this is where â€œthousandsâ€ comes from)
  // We cap to targetCount deterministically.
  const combos: SeoPage[] = [];
  for (const city of CITIES) {
    for (const service of SERVICES) {
      combos.push({
        path: `/locations/${slugify(city)}/${slugify(service)}`,
        title: `${service} in ${city}`,
        description: `Launch a ${service.toLowerCase()} site for ${city} with AI.`,
        priority: 0.55,
        changefreq: "monthly",
      });
    }
  }

  // Add combos until we hit targetCount
  for (const p of combos) {
    if (pages.length >= targetCount) break;
    pages.push(p);
  }

  // Ensure unique paths + clean
  const byPath = new Map<string, SeoPage>();
  for (const p of pages) {
    const path = String(p.path || "").trim();
    if (!path.startsWith("/")) continue;
    byPath.set(path, { ...p, path });
  }

  // Deterministic order by path (stable for diffing)
  const ordered = Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path));

  // Touch baseUrl so itâ€™s not â€œunusedâ€ (helps readers; sitemap will use baseUrl too)
  void baseUrl;

  return ordered;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const projectId = String(req.query.projectId || "").trim();
  if (!projectId) return res.status(400).json({ ok: false, error: "Missing projectId" });

  // Controls (safe defaults)
  const targetCount = Math.min(Math.max(Number(req.query.targetCount || 2500), 50), 10000);
  const chunkSize = Math.min(Math.max(Number(req.query.chunkSize || 500), 100), 2000);

  const baseUrl = safeBaseUrl(req);
  const generatedAtIso = new Date().toISOString();

  const pages = buildPages(baseUrl, targetCount);
  const chunks = chunk(pages, chunkSize);

  const chunkKeys = chunks.map((_, idx) => `project:${projectId}:seoPlan:chunk:${idx + 1}`);

  // Write chunks first
  for (let i = 0; i < chunks.length; i++) {
    const key = chunkKeys[i];
    await kvJsonSet(key, {
      ok: true,
      projectId,
      chunk: i + 1,
      chunkSize,
      pages: chunks[i],
    });
  }

  // Write small index last
  const indexKey = `project:${projectId}:seoPlan`;
  const index: SeoPlanIndex = {
    ok: true,
    version: "seoPlan-v3-chunked",
    projectId,
    generatedAtIso,
    baseUrl,
    totals: {
      pages: pages.length,
      chunks: chunks.length,
      chunkSize,
    },
    chunkKeys,
    samplePaths: pages.slice(0, 12).map((p) => p.path),
  };

  await kvJsonSet(indexKey, index);

  return res.status(200).json({
    ok: true,
    agent: "seo-v2",
    projectId,
    message: "seoPlan written (chunked)",
    indexKey,
    totals: index.totals,
    samplePaths: index.samplePaths,
  });
}

