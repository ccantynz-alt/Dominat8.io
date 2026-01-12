export async function withBackoff<T>(fn: () => Promise<T>, opts?: { retries?: number }) {
  const retries = opts?.retries ?? 3;

  let lastErr: any = null;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || "");
      const status = Number(e?.status || e?.code || 0);

      // retry on 429 or "rate limit" strings
      const retryable = status === 429 || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("429");
      if (!retryable || i === retries) break;

      const sleepMs = Math.min(8000, 400 * Math.pow(2, i) + Math.floor(Math.random() * 250));
      await new Promise((r) => setTimeout(r, sleepMs));
    }
  }

  throw lastErr || new Error("Request failed");
}
