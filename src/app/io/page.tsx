import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import "@/io/styles/io.css";
import "@/io/styles/io.globals.css";
import { RocketCockpit } from "@/io/surfaces/RocketCockpit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCH_ID = "IO_ROCKET_COCKPIT_v2_20260220";

export default async function IOPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <RocketCockpit patchId={PATCH_ID} />;
}
