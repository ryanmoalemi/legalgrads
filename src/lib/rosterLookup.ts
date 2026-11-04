export interface RosterHit {
  name: string;
  admitted: string;
  /** ISO date only when the roster published a day. Year-only rows leave this empty. */
  admissionDate: string;
  school: string;
  city: string;
  path: string;
  yearOnly: boolean;
}

const cache = new Map<string, Record<string, string[]>>();

export function normalizeBarKey(value: string): string {
  const text = value.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^0+/, '');
  return text || '0';
}

export async function lookupRoster(state: string, bar: string): Promise<RosterHit | null> {
  const code = state.trim().toLowerCase();
  const key = normalizeBarKey(bar);
  if (!code || !key) return null;
  let table = cache.get(code);
  if (!table) {
    const response = await fetch(`/data/bar-lookup/${code}.json`);
    if (!response.ok) return null;
    table = (await response.json()) as Record<string, string[]>;
    cache.set(code, table);
  }
  const row = table[key];
  if (!row) return null;
  const [name, admitted, admissionDate, school, city, path] = row;
  const yearOnly = /^\d{4}$/.test(admitted) && !admissionDate;
  return { name, admitted, admissionDate: admissionDate || '', school, city, path, yearOnly };
}
