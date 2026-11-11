'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type HubRow = {
  slug: string;
  name: string;
  abbr: string;
  upfront: string;
  upfrontNote: string;
  upfrontSort: number | null;
  ube: boolean;
  ubeShort: string;
  cle: string;
  relief: string;
  feeRelief: boolean;
  under400: boolean;
  inPerson: boolean;
};

const FILTERS = [
  { id: 'all', label: 'All states' },
  { id: 'relief', label: 'Waives 1st-year dues' },
  { id: 'ube', label: 'Accepts UBE transfers' },
  { id: 'inperson', label: 'In-person 1st-year course' },
  { id: 'u400', label: 'Under $400 upfront' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];
type SortKey = 'name' | 'upfront' | 'ube' | 'cle' | 'relief';

export function HubTable({ rows, base }: { rows: HubRow[]; base: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterId>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  const filtered = useMemo(() => rows.filter((row) => {
    if (filter === 'relief') return row.feeRelief;
    if (filter === 'ube') return row.ube;
    if (filter === 'inperson') return row.inPerson;
    if (filter === 'u400') return row.under400;
    return true;
  }), [rows, filter]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const value = (row: HubRow) => {
      if (sort.key === 'name') return row.name;
      if (sort.key === 'upfront') return row.upfrontSort ?? Number.POSITIVE_INFINITY;
      if (sort.key === 'ube') return row.ubeShort;
      if (sort.key === 'cle') return row.cle;
      return row.relief;
    };
    const left = value(a);
    const right = value(b);
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sort.dir;
    return String(left).localeCompare(String(right)) * sort.dir;
  }), [filtered, sort]);

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
    <div data-testid="national-table">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter states">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} data-testid={`filter-${item.id}`}
            className={`min-h-10 rounded-full px-4 font-display text-sm font-bold ${filter === item.id ? 'bg-navy text-white' : 'bg-cream text-navy'}`}>{item.label}</button>
        ))}
      </div>
      <ul className="mt-4 space-y-3 md:hidden">
        {sorted.map((row) => (
          <li key={row.abbr}>
            <Link href={`${base}${row.slug}/`} data-testid={`row-link-${row.slug}`} onClick={(event) => event.stopPropagation()} className="block rounded-3xl bg-cream p-4">
              <span className="font-display text-lg font-extrabold text-navy">{row.name}</span>
              <span className="ml-2 rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-navy">{row.abbr}</span>
              <span className="mt-2 block font-display text-2xl font-extrabold text-navy">{row.upfront}</span>
              <span className="mt-1 block text-sm text-ink">{row.upfrontNote}</span>
              <span className="mt-2 block text-sm text-navy">UBE: {row.ubeShort} · CLE: {row.cle}</span>
              <span className="mt-1 block text-sm text-navy">Fee relief: {row.relief}</span>
            </Link>
          </li>
        ))}
        {sorted.length === 0 && <li className="text-ink">No states match this filter.</li>}
      </ul>
      <div className="mt-4 hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-ink/70">
              {headers.map(([key, label]) => (
                <th key={key} className="px-3 py-3">
                  <button type="button" className="font-bold" onClick={() => toggle(key)} aria-pressed={sort.key === key}>{label}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.abbr} data-testid={`row-${row.slug}`} className="cursor-pointer border-t border-navy/5 align-top hover:bg-cream/60"
                onClick={() => router.push(`${base}${row.slug}/`)}>
                <th className="px-3 py-4 font-display font-bold text-navy">
                  <Link className="underline decoration-purple/40 hover:text-purple" href={`${base}${row.slug}/`} onClick={(event) => event.stopPropagation()}>{row.name}</Link>
                  <span className="ml-2 rounded-lg bg-cream px-2 py-0.5 text-xs text-navy/70">{row.abbr}</span>
                </th>
                <td className="px-3 py-4"><p className="font-display font-extrabold text-navy">{row.upfront}</p><p className="max-w-xs text-xs text-ink">{row.upfrontNote}</p></td>
                <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${row.ube ? 'bg-mint/15 text-[#00735E]' : 'bg-navy/5 text-navy'}`}>{row.ubeShort}</span></td>
                <td className="px-3 py-4 text-sm text-navy">{row.cle}</td>
                <td className="px-3 py-4 text-sm text-navy">{row.relief}</td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-ink">No states match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
