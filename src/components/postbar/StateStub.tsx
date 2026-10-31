import Link from 'next/link';
import { TRACKER_PATH, prettyDate, range, type PostBarState } from '@/lib/postBar';

export function StateStub({ s }: { s: PostBarState }) {
  const crumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Post-Bar Licensing Tracker', item: `https://legalgrads.com${TRACKER_PATH}` },
    { '@type': 'ListItem', position: 2, name: s.name, item: `https://legalgrads.com${TRACKER_PATH}${s.slug}/` },
  ] };
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16" data-testid="state-stub">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      <Link href={TRACKER_PATH} className="text-sm font-semibold text-purple underline">All jurisdictions</Link>
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-purple" data-testid="state-eyebrow">{s.name} · Quick facts</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">{s.name} Swearing-In Fees &amp; First-Year CLE (2026-2027)</h1>
      <p className="mt-2 text-sm text-ink/70">Checked against official sources · {prettyDate(s.lastVerified)}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-navy p-5 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/70">Upfront after the bar</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl" data-testid="stub-upfront">{range(s)}</p></div>
        <div className="rounded-3xl bg-pink p-5 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">Year 1 CLE</p><p className="mt-1 font-display text-2xl font-extrabold">{s.firstYearCle.short}</p></div>
        <div className="rounded-3xl bg-purple p-5 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">Accepts UBE transfers</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{s.ubeShort}</p></div>
      </div>
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">What you pay</h2>
        {s.upfront && <p className="mt-2 font-semibold text-navy">{s.upfront.label}</p>}
        <p className="mt-1 text-ink">{s.upfrontNote}</p>
        <h2 className="mt-6 font-display text-xl font-extrabold text-navy">Fee relief</h2>
        <p className="mt-1 text-ink">{s.feeReliefShort || 'No new-admittee waiver or scaling found on the official pages.'}</p>
      </section>
      <section className="mt-6 rounded-3xl bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">Official sources</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">{s.sources.map((src) => <li key={src.url}><a className="text-purple underline" href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a></li>)}</ul>
        <p className="mt-5 text-sm text-ink">Bar exam fees not included. Fees change, so confirm before you pay. General information, not legal advice.</p>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={TRACKER_PATH} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 font-display text-sm font-semibold text-navy ring-1 ring-navy/10">Compare states</Link>
        <Link href={`${TRACKER_PATH}california/`} className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 font-display text-sm font-semibold text-white">Try the California fee calculator</Link>
      </div>
    </div>
  );
}
