import nextDynamic from "next/dynamic";

/**
 * Dominat8 Homepage
 * Marker: WOW_HOME_V3
 *
 * SSR-safe wrapper. Client-only homepage allows window usage safely.
 */

export const dynamic = "force-dynamic";

const HomeClient = nextDynamic(() => import("./_client/HomeClient"), { ssr: false });

export default function Page() {
  return <HomeClient />;
}