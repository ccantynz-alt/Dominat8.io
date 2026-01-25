import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// NOTE: nextDynamic (not "dynamic") prevents a name collision with `export const dynamic = ...`
const HomeClient = nextDynamic(() => import("./_client/HomeClient"), { ssr: false });

export default function Page() {
  return <HomeClient />;
}