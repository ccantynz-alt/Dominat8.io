import { Suspense } from "react";
import PublishedClient from "./PublishedClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <PublishedClient />
    </Suspense>
  );
}
