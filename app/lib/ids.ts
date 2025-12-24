import crypto from "crypto";

export function makeId(prefix: string) {
  const raw = crypto.randomBytes(16).toString("base64url");
  return `${prefix}_${raw}`;
}
