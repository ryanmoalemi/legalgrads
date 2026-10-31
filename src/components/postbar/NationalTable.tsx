'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { PostBarState } from '@/lib/postBar';

const FILTERS = [
  { id: 'all', label: 'All states' },
  { id: 'ube', label: 'Accepts UBE transfers' },
  { id: 'u500', label: 'Under $500 upfront' },
  { id: 'relief', label: 'Fee waivers / scaling' },
  { id: 'nocle', label: 'No extra 1st-year CLE' },
] as const;
type F = (typeof FILTERS)[number]['id'];
const money = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
const range = (s: PostBarState) => (!s.upfront ? 'Not verified' : s.upfront.low === s.upfront.high ? money(s.upfront.low) : `${money(s.upfront.low)} to ${money(s.upfront.high)}`);

export function NationalTable({ states, base, embed = false }: { states: PostBarState[]; base: string; embed?: boolean }) {
  const [f, setF] = useState<F>('all');
  const rows = states.filter((s) => f === 'all' || (f === 'ube' && s.ube) || (f === 'u500' && !!s.upfront && s.upfront.high < 500) || (f === 'relief' && s.feeRelief) || (f === 'nocle' && !s.firstYearCle.required));
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
            <th className="px-6 py-3">State</th><th className="px-6 py-3">Upfront after the bar</th><th className="px-6 py-3">UBE in?</th><th className="px-6 py-3">1st-year CLE</th><th className="px-6 py-3">Fee relief</th>
          </tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.slug} className="border-t border-navy/5 align-top" data-testid={`row-${s.slug}`}>
                <th className="px-6 py-4 font-display font-bold text-navy">
                  {s.page ? <Link target={embed ? '_blank' : undefined} className="underline decoration-purple/40 hover:text-purple" href={`${base}${s.slug}/`}>{s.name}</Link> : s.name}
                  <span className="ml-2 rounded-lg bg-cream px-2 py-0.5 text-xs text-navy/70">{s.abbr}</span>
                </th>
                <td className="px-6 py-4"><p className="font-display font-extrabold text-navy">{range(s)}</p><p className="text-xs text-ink">{s.upfrontNote}</p></td>
                <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-sm font-bold ${s.ube ? 'bg-mint/15 text-[#00735E]' : 'bg-navy/5 text-navy/70'}`}>{s.ubeShort}</span></td>
                <td className="px-6 py-4 text-sm text-navy">{s.firstYearCle.short}</td>
                <td className="px-6 py-4 text-sm text-navy">{s.feeReliefShort || 'None found'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-6 py-6 text-ink">No states match yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
