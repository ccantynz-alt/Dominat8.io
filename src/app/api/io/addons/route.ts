import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  ADDONS,
  getAvailableAddons,
  getUserAddons,
  enableAddon,
  disableAddon,
  calculateAddonRevenue,
  maxRevenuePotential,
} from "@/lib/addons";
import { isAdminUser } from "@/lib/agent-credits";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

// GET — list available add-ons for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const planRaw = await kv.get<string>(`user:${userId}:plan`);
  const plan = ["starter", "pro", "agency"].includes(planRaw ?? "") ? planRaw! : "free";

  const { available, locked } = getAvailableAddons(plan);
  const active = await getUserAddons(userId);
  const revenue = calculateAddonRevenue(active);
  const potential = maxRevenuePotential(plan);

  return Response.json({
    ok: true,
    plan,
    activeAddons: active,
    available: available.map((a) => ({
      ...a,
      active: active.includes(a.id),
    })),
    locked: locked.map((a) => ({
      id: a.id,
      label: a.label,
      description: a.description,
      icon: a.icon,
      priceCents: a.priceCents,
      billingType: a.billingType,
      minPlan: a.minPlan,
    })),
    revenue,
    potential,
  });
}

// POST — enable or disable an add-on
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { addonId, action } = await req.json();
  if (!addonId || !["enable", "disable"].includes(action)) {
    return Response.json({ error: "addonId and action (enable|disable) required" }, { status: 400 });
  }

  const addon = ADDONS.find((a) => a.id === addonId);
  if (!addon) {
    return Response.json({ error: `Unknown add-on: ${addonId}` }, { status: 400 });
  }

  // Check plan access
  if (!isAdminUser(userId)) {
    const planRaw = await kv.get<string>(`user:${userId}:plan`);
    const plan = planRaw ?? "free";
    const { available } = getAvailableAddons(plan);
    if (!available.find((a) => a.id === addonId)) {
      return Response.json(
        { error: `${addon.label} requires the ${addon.minPlan} plan or higher.` },
        { status: 403 },
      );
    }
  }

  if (action === "enable") {
    await enableAddon(userId, addonId);
  } else {
    await disableAddon(userId, addonId);
  }

  const active = await getUserAddons(userId);
  const revenue = calculateAddonRevenue(active);

  return Response.json({
    ok: true,
    addonId,
    action,
    activeAddons: active,
    revenue,
  });
}
