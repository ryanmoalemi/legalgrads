import type { PostBarState } from '@/lib/postBar';
import { range } from '@/lib/postBar';

export function KeyFindings({ states }: { states: PostBarState[] }) {
  const priced = states.filter((s) => s.upfront);
  const top = [...priced].sort((a, b) => b.upfront!.high - a.upfront!.high)[0];
  const zero = states.filter((s) => s.upfront && s.upfront.low === 0);
  const cle = states.filter((s) => s.firstYearCle.required);
  const maxCle = [...cle].filter((s) => s.firstYearCle.hours).sort((a, b) => b.firstYearCle.hours! - a.firstYearCle.hours!)[0];
  const ube = states.filter((s) => s.ube);
  const cards = [
    { k: 'Most expensive start', v: top ? top.name : '', s: top ? `${range(top)} upfront` : '' },
    { k: '$0 first-year path', v: `${zero.length} of ${states.length}`, s: zero.map((z) => z.abbr).join(', ') },
    { k: 'Heaviest year-1 CLE', v: maxCle ? `${maxCle.firstYearCle.hours} hrs` : '', s: maxCle ? maxCle.name : '' },
    { k: 'Extra 1st-year CLE', v: `${cle.length} of ${states.length}`, s: 'states add a new-lawyer requirement' },
    { k: 'Accept UBE transfers', v: `${ube.length} of ${states.length}`, s: 'CA, FL and GA do not' },
  ];
  return (
    <section className="mt-10" data-testid="key-findings">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Key findings 2026-2027</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">National rankings at a glance</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <div key={c.k} className={`rounded-3xl p-5 ${i === 0 ? 'bg-navy text-white' : i === 1 ? 'bg-mint/15 text-navy' : i === 2 ? 'bg-pink text-white' : 'bg-white text-navy shadow-card ring-1 ring-navy/5'}`}>
            <p className="text-xs font-bold uppercase tracking-wide opacity-75">{c.k}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{c.v}</p>
            <p className="mt-1 text-sm opacity-80">{c.s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
