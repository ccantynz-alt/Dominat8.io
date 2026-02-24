import { Suspense } from "react";
import { Builder } from "@/io/surfaces/Builder";

export default function Page() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
