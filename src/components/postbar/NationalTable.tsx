'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PostBarState } from '@/lib/postBar';
import { US_STATES } from '@/lib/states';

const FILTERS = [
  { id: 'all', label: 'All states' },
  { id: 'ube', label: 'Accepts UBE transfers' },
  { id: 'u500', label: 'Under $500 upfront' },
  { id: 'relief', label: 'Fee waivers / scaling' },
  { id: 'nocle', label: 'No extra 1st-year CLE' },
] as const;
type F = (typeof FILTERS)[number]['id'];
type SortKey = 'name' | 'upfront' | 'ube' | 'cle' | 'relief';
type Row = PostBarState & { researched: boolean };

const money = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
const range = (s: Row) => {
  if (!s.researched) return 'Not yet researched';
  if (!s.upfront) return 'Not verified';
  return s.upfront.low === s.upfront.high ? money(s.upfront.low) : `${money(s.upfront.low)} to ${money(s.upfront.high)}`;
};

function withUnresearched(states: PostBarState[]): Row[] {
  const known = new Set(states.map((s) => s.abbr));
  const researched = states.map((s) => ({ ...s, researched: true }));
  const missing = US_STATES.filter((s) => !known.has(s.code)).map((s) => ({
    slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: s.name,
    abbr: s.code,
    page: false,
    lastVerified: '',
    upfront: null,
    upfrontNote: 'Not yet researched',
    ube: false,
    ubeShort: 'Not yet researched',
    firstYearCle: { required: false, hours: null, short: 'Not yet researched' },
    cleTax: 0,
    feeRelief: false,
    feeReliefShort: 'Not yet researched',
    sources: [],
    researched: false,
  }));
  return [...researched, ...missing];
}

export function NationalTable({ states, base, embed = false }: { states: PostBarState[]; base: string; embed?: boolean }) {
  const [f, setF] = useState<F>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  const all = useMemo(() => withUnresearched(states), [states]);
  const filtered = all.filter((s) => {
    if (!s.researched) return f === 'all';
    return f === 'all' || (f === 'ube' && s.ube) || (f === 'u500' && !!s.upfront && s.upfront.high < 500) || (f === 'relief' && s.feeRelief) || (f === 'nocle' && !s.firstYearCle.required);
  });
  const rows = [...filtered].sort((a, b) => {
    const blank = (s: Row) => (s.researched ? 0 : 1);
    if (blank(a) !== blank(b)) return blank(a) - blank(b);
    const value = (s: Row) => {
      if (sort.key === 'name') return s.name;
      if (sort.key === 'upfront') return s.upfront ? s.upfront.low : Number.POSITIVE_INFINITY;
      if (sort.key === 'ube') return s.ubeShort;
      if (sort.key === 'cle') return s.firstYearCle.short;
      return s.feeReliefShort || '';
    };
    const left = value(a);
    const right = value(b);
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sort.dir;
    return String(left).localeCompare(String(right)) * sort.dir;
  });
  function toggle(key: SortKey) {
    setSort((current) => ({ key, dir: current.key === key ? (current.dir === 1 ? -1 : 1) : 1 }));
  }
  const headers: [SortKey, string][] = [
    ['name', 'State'],
    ['upfront', 'Upfront after the bar'],
    ['ube', 'UBE in?'],
    ['cle', '1st-year CLE'],
    ['relief', 'Fee relief'],
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-2 px-4 pt-5 sm:px-6" role="group" aria-label="Filter states">
        {FILTERS.map((x) => (
          <button key={x.id} type="button" aria-pressed={f === x.id} onClick={() => setF(x.id)} data-testid={`filter-${x.id}`}
            className={`min-h-10 rounded-full px-4 font-display text-sm font-bold transition ${f === x.id ? 'bg-navy text-white' : 'bg-cream text-navy hover:bg-navy/10'}`}>{x.label}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="mt-3 w-full min-w-[720px] text-left" data-testid="national-table">
          <thead><tr className="text-xs uppercase tracking-wide text-ink/70">
            {headers.map(([key, label]) => (
              <th key={key} className="px-6 py-3">
                <button type="button" className="font-bold" onClick={() => toggle(key)} aria-pressed={sort.key === key}>{label}</button>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.abbr} className="border-t border-navy/5 align-top" data-testid={`row-${s.researched ? s.slug : `unresearched-${s.abbr}`}`}>
                <th className="px-6 py-4 font-display font-bold text-navy">
                  {s.researched ? (
                    <Link target={embed ? '_blank' : undefined} className="underline decoration-purple/40 hover:text-purple" href={`${base}${s.slug}/`} data-testid={`row-link-${s.slug}`}>{s.name}</Link>
                  ) : s.name}
                  <span className="ml-2 rounded-lg bg-cream px-2 py-0.5 text-xs text-navy/70">{s.abbr}</span>
                </th>
                <td className="px-6 py-4"><p className="font-display font-extrabold text-navy">{range(s)}</p><p className="text-xs text-ink">{s.researched ? s.upfrontNote : 'Not yet researched'}</p></td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${s.researched && s.ube ? 'bg-mint/15 text-[#00735E]' : 'bg-navy/5 text-navy/70'}`}>{s.researched ? s.ubeShort : 'Not yet researched'}</span></td>
                <td className="px-6 py-4 text-sm text-navy">{s.researched ? s.firstYearCle.short : 'Not yet researched'}</td>
                <td className="px-6 py-4 text-sm text-navy">{s.researched ? (s.feeReliefShort || 'None found') : 'Not yet researched'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-6 py-6 text-ink">No states match yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
