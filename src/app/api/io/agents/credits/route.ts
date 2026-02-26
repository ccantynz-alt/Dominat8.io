import { auth } from "@clerk/nextjs/server";
import {
  getAgentBalance,
  isAdminUser,
  AGENT_COSTS,
  PLAN_AGENT_ACCESS,
  PLAN_MONTHLY_CREDITS,
  CREDIT_PACKS,
} from "@/lib/agent-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = isAdminUser(userId);

  if (admin) {
    return Response.json({
      admin: true,
      balance: {
        plan: "admin",
        monthlyAllowance: 0,
        monthlyUsed: 0,
        monthlyRemaining: 999999,
        purchased: 0,
        total: 999999,
      },
      costs: AGENT_COSTS,
      access: ["seo-sweep", "design-fixer", "responsive-audit", "performance-optimizer", "accessibility-checker", "link-scanner"],
      packs: CREDIT_PACKS,
    });
  }

  const balance = await getAgentBalance(userId);

  return Response.json({
    admin: false,
    balance,
    costs: AGENT_COSTS,
    access: PLAN_AGENT_ACCESS[balance.plan] ?? PLAN_AGENT_ACCESS.free,
    planMonthly: PLAN_MONTHLY_CREDITS,
    packs: CREDIT_PACKS,
  });
}
