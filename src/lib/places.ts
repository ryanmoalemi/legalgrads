import rules from '@/data/place-rules.json';
import { US_STATES } from '@/lib/states';
const STATE_NAMES: Record<string, string> = Object.fromEntries(US_STATES.map((s) => [s.code, s.name]));

const TOKEN = rules.token as Record<string, string>;
const ZIP3 = rules.zip3 as [number, number, string][];

export function slugifyPlace(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fixMc(token: string): string {
  if (token.length > 3 && token.toLowerCase().startsWith('mc') && token[2] === token[2].toLowerCase()) {
    const rest = token.slice(2);
    return `Mc${rest[0].toUpperCase()}${rest.slice(1)}`;
  }
  return token;
}

/** Expand roster abbreviations such as Rch Cucamonga. Leave unknown names unchanged. */
export function expandCityName(raw: string): string {
  const cleaned = raw.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return raw;
  const parts = cleaned.split(' ');
  const out: string[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const token = parts[i];
    if (token.toLowerCase() === 'mc' && parts[i + 1]) {
      const next = parts[i + 1];
      out.push(`Mc${next[0].toUpperCase()}${next.slice(1).toLowerCase()}`);
      i += 1;
      continue;
    }
    const fixed = fixMc(token);
    const mapped = TOKEN[fixed.toLowerCase()];
    out.push(mapped || fixed);
  }
  return out.join(' ');
}

export function zipRegion(zip: string | undefined): string | null {
  if (!zip || !/^\d{5}/.test(zip)) return null;
  const n = Number(zip.slice(0, 3));
  for (const [start, end, region] of ZIP3) {
    if (n >= start && n <= end) return region;
  }
  return null;
}

/** Expand Univ / SOL style roster abbreviations. Do not guess a campus that was not written. */
export function expandSchool(name: string): string {
  if (!name || name === 'Not listed') return name;
  return name
    .replace(/\bUniv\.?\b/g, 'University')
    .replace(/^U of /i, 'University of ')
    .replace(/\bSOL\b/g, 'School of Law')
    .replace(/\bCOL\b/g, 'College of Law')
    .replace(/\bCtr\b/g, 'Center')
    .replace(/\s+/g, ' ')
    .trim();
}

/** False when a directory city is blank, "Office unlisted", or just the state name (except New York, NY). */
export function knownCity(city: string | null | undefined, stateCode: string): boolean {
  const value = (city || '').trim().toLowerCase();
  if (!value || /unlisted|not listed|unconfirmed|international/.test(value)) return false;
  const state = (STATE_NAMES[stateCode.toUpperCase()] || '').toLowerCase();
  return !(value === state && stateCode.toUpperCase() !== 'NY');
}
