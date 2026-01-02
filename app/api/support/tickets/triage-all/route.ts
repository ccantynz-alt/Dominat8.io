import { NextResponse } from "next/server";
import { listTickets } from "@/app/lib/supportKV";

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY env var" }, { status: 500 });
    }

    // We do the work by calling the existing per-ticket triage endpoint internally (simple + consistent).
    const tickets = await listTickets();

    let triaged = 0;
    let skipped = 0;

    for (const t of tickets) {
      // Skip if already triaged
      if (t.triage) {
        skipped++;
        continue;
      }

      const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/support/tickets/${t.id}/triage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => null);

      if (resp && resp.ok) triaged++;
    }

    return NextResponse.json({ ok: true, triaged, skipped, total: tickets.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to triage all" }, { status: 500 });
  }
}
