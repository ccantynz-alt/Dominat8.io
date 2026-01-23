import type { NextApiRequest, NextApiResponse } from "next";
import { saveSiteSpec } from "@/src/lib/projectSpecStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const projectId = req.query.projectId as string;
  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ ok: false, error: "Missing projectId" });
  }

  // Minimal â€œdraft specâ€ â€” safe and generic.
  // This is only for unblocking publish wiring.
  const spec = {
    version: 1,
    brand: {
      name: "Demo Co",
      tagline: "Automation-first website builder",
    },
    pages: [
      {
        id: "home",
        path: "/",
        title: "Home",
        sections: [
          {
            type: "hero",
            headline: "Your site, generated fast.",
            subheadline: "Publish-ready, automation-first websites â€” in minutes.",
            ctaText: "Start free",
            ctaHref: "/start",
          },
          {
            type: "features",
            items: [
              { title: "Fast setup", description: "Generate a complete site in minutes." },
              { title: "Automation-first", description: "Reduce manual work with smart flows." },
              { title: "Publish instantly", description: "Go live with one click." },
            ],
          },
        ],
      },
    ],
    createdAtIso: new Date().toISOString(),
  };

  await saveSiteSpec(projectId, spec as any);

  return res.status(200).json({
    ok: true,
    projectId,
    message: "Draft site spec created",
  });
}

