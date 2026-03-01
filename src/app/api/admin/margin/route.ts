import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/agent-credits";
import {
  getMarginSummary,
  TYPICAL_COSTS,
  CUSTOMER_PRICES,
} from "@/lib/cost-tracker";
import { ADDONS, maxRevenuePotential } from "@/lib/addons";

export const runtime = "nodejs";

/**
 * Admin-only margin dashboard API
 *
 * Returns comprehensive P&L data:
 *   - Monthly API costs vs revenue
 *   - Per-model cost breakdown
 *   - Add-on revenue potential
 *   - Pricing recommendations
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const summary = await getMarginSummary(currentMonth);

  // Per-model cost estimates (what each generation costs us)
  const modelCosts = Object.entries(TYPICAL_COSTS).map(([key, cost]) => ({
    model: key,
    typicalApiCostCents: cost.apiCostCents,
    customerPriceCents: cost.customerPriceCents,
    marginCents: cost.marginCents,
    marginPercent: cost.marginPercent,
  }));

  // Add-on revenue analysis
  const addonAnalysis = ADDONS.map((a) => ({
    id: a.id,
    label: a.label,
    priceCents: a.priceCents,
    billingType: a.billingType,
    marginPercent: a.marginPercent,
    monthlyMarginCents: a.billingType === "monthly"
      ? Math.round(a.priceCents * a.marginPercent / 100)
      : 0,
  }));

  const totalAddonMonthlyRevenue = addonAnalysis
    .filter((a) => a.billingType === "monthly")
    .reduce((sum, a) => sum + a.priceCents, 0);

  // Revenue potential per plan
  const planPotentials = ["free", "starter", "pro", "agency"].map((plan) => {
    const planData = CUSTOMER_PRICES.plans[plan as keyof typeof CUSTOMER_PRICES.plans];
    const addonPotential = maxRevenuePotential(plan);
    return {
      plan,
      subscriptionCents: planData.monthlyCents,
      maxAddonMonthlyCents: addonPotential.maxMonthlyCents,
      maxAddonOnetimeCents: addonPotential.maxOnetimeCents,
      totalMaxMonthlyCents: planData.monthlyCents + addonPotential.maxMonthlyCents,
      description: addonPotential.description,
    };
  });

  // Key metrics
  const breakEvenGens = summary.avgCostPerGenCents > 0
    ? Math.ceil(summary.totalRevenueCents / summary.avgCostPerGenCents)
    : 0;

  return Response.json({
    ok: true,
    month: currentMonth,
    summary,
    modelCosts,
    addonAnalysis,
    totalAddonMonthlyRevenue,
    planPotentials,
    keyMetrics: {
      breakEvenGenerations: breakEvenGens,
      avgMarginPerGen: summary.avgRevenuePerGenCents - summary.avgCostPerGenCents,
      isHealthy: summary.marginPercent > 50,
      recommendation: summary.marginPercent > 70
        ? "Margins are excellent. Consider investing in acquisition."
        : summary.marginPercent > 50
          ? "Margins are healthy. Push add-on adoption to increase LTV."
          : summary.marginPercent > 30
            ? "Margins are thin. Review model costs — push users toward Haiku/Sonnet."
            : "Margins are low. Consider price increase or shifting to cheaper models.",
    },
    pricing: CUSTOMER_PRICES,
  });
}
