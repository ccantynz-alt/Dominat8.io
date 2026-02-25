import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import "@/io/styles/io.css";
import "@/io/styles/io.globals.css";
import { RocketCockpit } from "@/io/surfaces/RocketCockpit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCH_ID = "IO_ROCKET_COCKPIT_v2_20260220";

export default async function IOPage() {
  await headers();
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch {
    /* Clerk auth() can throw in Next 16 (headers/symbol). Treat as unauthenticated. */
  }
  if (!userId) redirect("/sign-in");

  return <RocketCockpit patchId={PATCH_ID} />;
}
