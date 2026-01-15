import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignInCatchAllPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <SignIn />
    </main>
  );
}
