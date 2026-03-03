import nextDynamic from "next/dynamic";

// Dynamically import Builder with SSR disabled.
// Builder uses useUser() from Clerk which throws during static generation
// when ClerkProvider isn't available. ssr:false ensures it only runs client-side.
const Builder = nextDynamic(
  () => import("@/io/surfaces/Builder").then((m) => ({ default: m.Builder })),
  { ssr: false }
);

// Prevent Next.js from attempting to prerender this page at build time.
export const dynamic = "force-dynamic";

export default function BuildPage() {
  return <Builder />;
}
