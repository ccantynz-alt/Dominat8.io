import { NextResponse } from "next/server";
import { z } from "zod";
import { runDnsCheck } from "@/app/lib/dnsCheck";

const BodySchema = z.object({
  domain: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload. Expected { domain }" }, { status: 400 });
    }

    const result = await runDnsCheck({ domain: parsed.data.domain });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "DNS check failed" },
      { status: 500 }
    );
  }
}
