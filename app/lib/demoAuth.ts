import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  return session.userId ?? "demo";
}
