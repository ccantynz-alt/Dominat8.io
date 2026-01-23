import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const KEY_BRIEF = "marketing:dominat8:brandBrief:v1";
const KEY = "marketing:dominat8:heroLayout:v1";

function nowIso() {
  return new Date().toISOString();
}

function asString(v: any, fallback: string) {
  return typeof v === "string" && v.trim().length ? v.trim() : fallback;
}

async function readBrief() {
  try {
    const v = (await kv.get(KEY_BRIEF)) as any;
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const brief = await readBrief();
  const body = (req.body ?? {}) as any;

  const brandName = asString(body.brandName, brief?.brand?.name || "Dominat8");
  const product = asString(body.product, brief?.brand?.product || "AI Website Builder");

  const density = brief?.visual?.density || "spacious";
  const maxTextWidth = brief?.visual?.maxTextWidth || "normal";

  const spec = {
    marker: "AGENT_marketing_heroLayout_v2_2026-01-22",
    updatedAtIso: nowIso(),
    key: KEY,

    fromBrief: !!brief,
    brandName,
    product,

    container: {
      maxWidth: "max-w-6xl",
      paddingX: "px-6",
      paddingY: density === "compact" ? "py-10" : "py-14",
    },

    hero: {
      layout: "split", // "split" | "stack"
      headlineMaxWidthClass: maxTextWidth === "narrow" ? "max-w-2xl" : "max-w-3xl",
      subheadlineMaxWidthClass: maxTextWidth === "narrow" ? "max-w-xl" : "max-w-2xl",
      ctaLayout: density === "compact" ? "row" : "row",
      primaryCtaVariant: brief?.visual?.ctaStyle === "minimal" ? "outline" : "solid",
      secondaryCtaVariant: "outline",
      showPill: !!brief?.visual?.emphasis?.usePills,
      showBullets: true,
      bulletsColumns: 3,
      anchor: {
        type: brief?.visual?.emphasis?.useStatusBadge ? "readinessCard" : "readinessCard",
        placement: "right",
        float: true,
      },
      background: {
        type: brief?.visual?.style === "clean-light" ? "flat" : "gradient",
        intensity: 1,
      },
    },
  };

  try {
    await kv.set(KEY, spec);
    return res.status(200).json({ ok: true, key: KEY, exists: true, heroLayout: spec });
  } catch (e: any) {
    return res.status(500).json({ ok: false, key: KEY, error: String(e?.message || e) });
  }
}
