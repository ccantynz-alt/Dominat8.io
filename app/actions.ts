"use server";

export async function disabledProjectAction(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");

  // TODO: put your server-side logic here
  // e.g. update DB, publish, etc.
}
