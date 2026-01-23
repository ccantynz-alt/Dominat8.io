import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

const KEY_BRIEF = "marketing:dominat8:brandBrief:v1";
const KEY = "marketing:dominat8:readinessCard:v1";

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
  const blur = brief?.visual?.blur || "soft";
  const radius = brief?.visual?.radius || "3xl";
  const shadow = brief?.visual?.shadow || "soft";
  const useStatusBadge = !!brief?.visual?.emphasis?.useStatusBadge;
  const useChecklist = !!brief?.visual?.emphasis?.useChecklist;

  const spec = {
    marker: "AGENT_marketing_readinessCard_v2_2026-01-22",
    updatedAtIso: nowIso(),
    key: KEY,
    fromBrief: !!brief,
    brandName,

    card: {
      size: "lg",
      style: blur === "none" ? "solid" : "glass",
      radius,
      shadow,
      badge: { label: "Readiness check", tone: "success" },
      status: useStatusBadge
        ? { label: "Status", value: "Ready to publish", tone: "success" }
        : { label: "Status", value: "Ready", tone: "success" },
      rows: useChecklist
        ? [
            { label: "Pages", value: "Complete", tone: "success" },
            { label: "SEO", value: "Ready", tone: "success" },
            { label: "Broken links", value: "None found", tone: "success" },
          ]
        : [
            { label: "Readiness", value: "Green", tone: "success" },
            { label: "Confidence", value: "High", tone: "success" },
            { label: "Publish risk", value: "Low", tone: "success" },
          ],
      footnote: brief?.positioning?.promise || "Runs before you publish. Shows what matters right now.",
    },
  };

  try {
    await kv.set(KEY, spec);
    return res.status(200).json({ ok: true, key: KEY, exists: true, readinessCard: spec });
  } catch (e: any) {
    return res.status(500).json({ ok: false, key: KEY, error: String(e?.message || e) });
  }
}
