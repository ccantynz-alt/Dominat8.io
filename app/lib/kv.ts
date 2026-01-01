export function kvNowISO() {
  return new Date().toISOString();
}

export async function kvJsonGet<T>(_key: string): Promise<T | null> {
  return null;
}

export async function kvJsonSet<T>(_key: string, _value: T): Promise<void> {
  return;
}
