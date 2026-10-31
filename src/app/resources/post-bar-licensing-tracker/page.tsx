import type { Metadata } from 'next';
import Link from 'next/link';
import { POST_BAR, POST_BAR_STATES, TRACKER_PATH, prettyDate, range } from '@/lib/postBar';

const title = 'Post-Bar Licensing & First-Year CLE Tracker 2026-2027';
const description = 'What it costs to get sworn in after the bar, first-year CLE hours, and UBE portability. California and New York, checked against official sources.';
export const metadata: Metadata = { title, description, alternates: { canonical: TRACKER_PATH }, openGraph: { title, description, url: TRACKER_PATH } };

function Pill({ yes, children }: { yes: boolean; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 font-display text-sm font-bold ${yes ? 'bg-mint/15 text-[#00735E]' : 'bg-navy/5 text-navy/70'}`}>{children}</span>;
}

export default function Page() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: title,
    itemListElement: POST_BAR_STATES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: `https://legalgrads.com${TRACKER_PATH}${s.slug}/` })),
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="font-display text-sm font-bold text-purple">Resources · For new attorneys</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">Passed the bar.<br /><span className="text-pink">Now what?</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">Swearing-in costs, first-year CLE, and UBE portability. One glance per state.</p>
      <p className="mt-3 text-sm text-ink/70">Checked against official sources · {prettyDate(POST_BAR.lastVerified)}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {POST_BAR_STATES.map((s) => (
          <Link key={s.slug} href={`${TRACKER_PATH}${s.slug}/`} data-testid={`tracker-card-${s.slug}`} className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 transition hover:-translate-y-0.5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold text-navy">{s.name}</h2>
              <span className="rounded-2xl bg-cream px-3 py-1 font-display text-sm font-bold text-navy">{s.abbr}</span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ink/70">Upfront after the bar</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-navy sm:text-5xl">{range(s)}</p>
            <p className="mt-1 text-sm text-ink">{s.upfront.label}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">UBE state</dt><dd className="mt-2"><Pill yes={s.ube}>{s.ubeShort}</Pill></dd></div>
              <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">Year 1 CLE</dt><dd className="mt-2"><Pill yes={s.firstYearCle.required}>{s.firstYearCle.short}</Pill></dd></div>
            </dl>
            <p className="mt-6 font-display text-sm font-bold text-purple group-hover:underline">See the full {s.name} breakdown →</p>
          </Link>
        ))}
      </div>

      <section className="mt-14 overflow-x-auto rounded-3xl bg-white shadow-pill ring-1 ring-navy/5">
        <table className="w-full min-w-[560px] text-left">
          <caption className="px-6 pt-6 text-left font-display text-xl font-extrabold text-navy">Side by side</caption>
          <thead><tr className="text-xs uppercase tracking-wide text-ink/70">
            <th className="px-6 py-4">State</th><th className="px-6 py-4">Upfront cost</th><th className="px-6 py-4">UBE?</th><th className="px-6 py-4">Year 1 CLE</th><th className="px-6 py-4">Last verified</th>
          </tr></thead>
          <tbody>
            {POST_BAR_STATES.map((s) => (
              <tr key={s.slug} className="border-t border-navy/5">
                <th className="px-6 py-4 font-display font-bold text-navy"><Link className="underline decoration-purple/40 hover:text-purple" href={`${TRACKER_PATH}${s.slug}/`}>{s.name}</Link></th>
                <td className="px-6 py-4 font-display font-bold text-navy">{range(s)}</td>
                <td className="px-6 py-4">{s.ubeShort}</td>
                <td className="px-6 py-4">{s.firstYearCle.short}</td>
                <td className="px-6 py-4 text-sm text-ink">{prettyDate(s.lastVerified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-10 rounded-2xl bg-cream p-5 text-sm text-ink">More states coming. Upfront cost excludes bar exam fees. Fees change, so confirm with your licensing body before you pay. This is general information, not legal advice.</p>
    </div>
  );
}
