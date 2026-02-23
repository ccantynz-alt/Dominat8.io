import { Builder } from "@/io/surfaces/Builder";
import FuturisticLandingPage from "./FuturisticLandingPage";

export const metadata = {
  title: "Dominat8 — Your website doesn't sit there. It works.",
  description: "Generate. Launch. Rank. The AI system that keeps your site alive and growing.",
};

export default function Page() {
  // To show the splash screen again, swap to: return <FuturisticLandingPage />;
  return <Builder />;
}
