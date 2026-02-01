/**
 * Minimal guard types used by machine API classification.
 * Exists to keep builds green with stable typing.
 */
export type GuardCheck = {
  ok: boolean;
  name: string;
  detail?: string;
  status?: number | null;
};
export function guardOk(name: string, detail?: string): GuardCheck {
  return { ok: true, name, detail };
}
export function guardFail(name: string, detail?: string): GuardCheck {
  return { ok: false, name, detail };
}

