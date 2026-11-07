import fs from 'node:fs';
import path from 'node:path';

type SuppressionFile = { keys: string[]; names: string[]; emails: string[] };
type SuppressionRules = { keys: Set<string>; names: Set<string>; emails: Set<string> };

const SUFFIXES = new Set(['esq', 'esquire', 'jr', 'sr', 'ii', 'iii', 'iv', 'v', 'phd', 'llm']);
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;

let cached: SuppressionRules | null = null;

export function normalizeAttorneyName(value: string): string {
  const text = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = text.split(/\s+/).filter((token) => token && !SUFFIXES.has(token) && !/^\d+$/.test(token));
  return tokens.slice().sort().join(' ');
}

function loadRules(): SuppressionRules {
  if (cached) return cached;
  const file = path.join(process.cwd(), 'src/data/suppressed-profiles.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as SuppressionFile;
  cached = {
    keys: new Set(data.keys),
    names: new Set(data.names.map((name) => normalizeAttorneyName(name))),
    emails: new Set(data.emails.map((email) => email.trim().toLowerCase())),
  };
  return cached;
}

function stringsOf(value: unknown, found: string[]): void {
  if (typeof value === 'string') found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => stringsOf(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => stringsOf(item, found));
}

export function isSuppressedRecord(record: {
  stateCode?: string;
  state?: string;
  s?: string;
  licensed_state?: string;
  barNumber?: string;
  bar_number?: string;
  id?: string;
  name?: string;
  n?: string;
  full_name?: string;
  fullName?: string;
  slug?: string;
  u?: string;
  profilePath?: string;
  profile_path?: string;
  email?: string;
}): boolean {
  const rules = loadRules();
  const state = record.stateCode || record.s || record.licensed_state || (record.state && /^[A-Za-z]{2}$/.test(record.state) ? record.state : '');
  const bar = record.barNumber || record.bar_number || (record.id && /^[0-9A-Za-z-]{1,20}$/.test(record.id) ? record.id : '');
  if (state && bar && rules.keys.has(`${state.toLowerCase()}-${bar.toLowerCase()}`)) return true;
  const paths = [record.u, record.profilePath, record.profile_path, record.slug].filter(Boolean) as string[];
  for (const value of paths) {
    const parts = value.split('/').filter(Boolean);
    if (parts.length >= 4 && parts[0] === 'attorneys' && /^[A-Za-z]{2}$/.test(parts[1] || '')) {
      const slugBar = parts[parts.length - 1].split('-').pop() || '';
      if (rules.keys.has(`${parts[1].toLowerCase()}-${slugBar.toLowerCase()}`)) return true;
    }
    const segment = value.replace(/\/$/, '').split('/').pop() || value;
    if (rules.names.has(normalizeAttorneyName(segment.replace(/-/g, ' ')))) return true;
  }
  for (const name of [record.name, record.n, record.full_name, record.fullName]) {
    if (name && rules.names.has(normalizeAttorneyName(name))) return true;
  }
  const strings: string[] = [];
  stringsOf(record, strings);
  for (const value of strings) {
    for (const email of value.match(EMAIL_RE) || []) {
      if (rules.emails.has(email.toLowerCase())) return true;
    }
  }
  return false;
}
