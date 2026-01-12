import { NextResponse } from "next/server";

// SSE stream that *proxies* your existing run details endpoint (/api/runs/[runId])
// so we don't have to guess your KV key formats or internal runs exports.
export async function GET(
  req: Request,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;
  const origin = new URL(req.url).origin;

  let lastCount = 0;
  let lastStatus: string | null = null;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: any) => {
        const payload =
          `event: ${event}\n` +
          `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // Initial hello (helps debugging)
      send("hello", { ok: true, runId });

      try {
        while (!req.signal.aborted) {
          // Fetch run + logs from your existing endpoint
          const res = await fetch(`${origin}/api/runs/${runId}`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          });

          const data = await res.json().catch(() => null);

          if (!res.ok || !data?.ok) {
            send("error", {
              ok: false,
              error: data?.error ?? `Failed to load run ${runId}`,
            });
            break;
          }

          const run = data.run ?? null;
          const logs: string[] = Array.isArray(data.logs) ? data.logs : [];

          const status = run?.status ?? null;

          const delta =
            logs.length > lastCount ? logs.slice(lastCount) : [];

          const statusChanged = status && status !== lastStatus;

          if (delta.length > 0 || statusChanged) {
            send("update", {
              ok: true,
              run,
              delta,
              total: logs.length,
            });
            lastCount = logs.length;
            lastStatus = status;
          } else {
            // Heartbeat to keep connection alive in some proxies
            send("ping", { ok: true });
          }

          // Stop when terminal
          if (status === "done" || status === "failed") {
            send("done", { ok: true, status });
            break;
          }

          await sleep(900);
        }
      } catch (e: any) {
        send("error", { ok: false, error: e?.message ?? "Stream failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
