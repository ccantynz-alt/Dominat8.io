// pages/sign-up/[[...index]].tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}


