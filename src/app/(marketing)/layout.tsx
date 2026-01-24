export const runtime = "nodejs";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  // FULL-BLEED: Do NOT wrap children in max-w containers here.
  return <>{children}</>;
}
