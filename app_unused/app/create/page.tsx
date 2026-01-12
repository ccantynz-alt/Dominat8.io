import { Suspense } from "react";
import CreateClient from "./CreateClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <CreateClient />
    </Suspense>
  );
}
