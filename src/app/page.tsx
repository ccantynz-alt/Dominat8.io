import { AppNav } from "../ui/layout/AppNav";
import { AppFooter } from "../ui/layout/AppFooter";
import HomeClient from "./_client/HomeClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <AppNav />
      <HomeClient />
      <AppFooter />
    </>
  );
}