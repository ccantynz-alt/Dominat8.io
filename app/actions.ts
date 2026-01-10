"use server";

export async function doThing(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  // server-side work here
}
