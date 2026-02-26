import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";

export default function BuildPage() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
