import type { PostBarState } from '@/lib/postBar';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export function CaReceipt({ r }: { r: NonNullable<PostBarState['receipt']> }) {
  const base = r.items.reduce((a, i) => a + i.amount, 0);
  const low = base + r.license.low, high = base + r.license.high;
  return (
    <section id="true-cost" className="mt-8 grid gap-6 rounded-3xl bg-navy p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.1fr]" data-testid="ca-receipt">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-wide text-white/70">The true cost</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Total official bill, 3L to bar number</h2>
        <p className="mt-4 font-display text-5xl font-extrabold text-pink sm:text-6xl" data-testid="receipt-total">{usd(low)} to {usd(high)}</p>
        <p className="mt-2 text-white/80">Paid to the State Bar and NCBE before you buy a single bar prep course. The range is your swearing-in month.</p>
        <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-white/90">Compare: Illinois, New Jersey and Pennsylvania charge new admittees $0 for the first license or registration year.</p>
      </div>
      <div className="rounded-2xl bg-white p-5 font-mono text-sm text-navy shadow-card" data-testid="receipt-card">
        <p className="text-center font-display text-xs font-bold uppercase tracking-widest text-ink/60">Receipt · California licensure · 2026</p>
        <ul className="mt-4 space-y-2 border-y border-dashed border-navy/20 py-3">
          {r.items.map((i) => (
            <li key={i.label} className="flex items-start justify-between gap-3"><span><span className="font-sans font-semibold">{i.label}</span><br /><span className="font-sans text-xs text-ink/70">{i.rule} · {i.when}</span></span><span className="shrink-0 font-bold">{usd(i.amount)}</span></li>
          ))}
          <li className="flex items-start justify-between gap-3"><span><span className="font-sans font-semibold">First license fee</span><br /><span className="font-sans text-xs text-ink/70">{r.license.note}</span></span><span className="shrink-0 font-bold">{usd(r.license.low)} to {usd(r.license.high)}</span></li>
        </ul>
        <div className="mt-3 flex justify-between font-bold"><span>Total</span><span>{usd(low)} to {usd(high)}</span></div>
        <details className="mt-4 font-sans text-xs text-ink">
          <summary className="cursor-pointer font-semibold text-navy">Not included</summary>
          <ul className="mt-2 list-disc pl-5">{r.excluded.map((x) => <li key={x}>{x}</li>)}</ul>
        </details>
        <p className="mt-3 font-sans text-xs text-ink/70">Sources: {r.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a className="text-purple underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>)}</p>
      </div>
    </section>
  );
}
