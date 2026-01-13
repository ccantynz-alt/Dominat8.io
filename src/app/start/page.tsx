// src/app/start/page.tsx

import type { Metadata } from "next";
import StartClient from "./StartClient";
import { USE_CASES, TEMPLATES } from "../lib/marketingCatalog";

export const metadata: Metadata = {
  title: "Start | Build your site",
  description: "Choose a use case and template, then create your project.",
};

export default function Page() {
  return (
    <StartClient
      useCases={USE_CASES}
      templates={TEMPLATES}
    />
  );
}
