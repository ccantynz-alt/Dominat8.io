export function autoTriage(subject: string, body: string) {
  const text = `${subject} ${body}`.toLowerCase();

  const tags: string[] = [];
  let priority: "low" | "medium" | "high" = "medium";

  if (text.includes("dns")) tags.push("dns");
  if (text.includes("ssl") || text.includes("https")) tags.push("ssl");
  if (text.includes("bill") || text.includes("payment")) {
    tags.push("billing");
    priority = "high";
  }
  if (text.includes("deploy") || text.includes("publish")) tags.push("deploy");
  if (text.includes("login") || text.includes("auth")) tags.push("auth");
  if (text.includes("seo")) tags.push("seo");

  if (tags.length === 0) tags.push("general");

  return { tags, priority };
}
