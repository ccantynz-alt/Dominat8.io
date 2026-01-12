import { auth } from "@clerk/nextjs/server";

export async function requireUserId() {
  // DEV BYPASS: lets you move fast in Codespaces
  if (process.env.DEV_BYPASS_AUTH === "1") {
    return { userId: "dev_user" as string };
  }

  const { userId } = await auth();
  if (!userId) {
    return { userId: null as string | null };
  }
  return { userId };
}
