import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_STATES, POST_BAR, POST_BAR_STATES, TRACKER_PATH, prettyDate, range } from '@/lib/postBar';
import { KeyFindings } from '@/components/postbar/KeyFindings';
import { NationalTable } from '@/components/postbar/NationalTable';
import { EmbedBox } from '@/components/postbar/EmbedBox';

const title = 'Post-Bar Licensing & First-Year CLE Tracker 2026-2027';
const description = `Swearing-in costs, first-year CLE hours, fee waivers and UBE portability for ${ALL_STATES.length} jurisdictions, checked against official bar sources. Free to embed.`;
export const metadata: Metadata = { title, description, alternates: { canonical: TRACKER_PATH }, openGraph: { title, description, url: TRACKER_PATH } };

export default function Page() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'ItemList', name: title, itemListElement: POST_BAR_STATES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: `https://legalgrads.com${TRACKER_PATH}${s.slug}/` })) },
    { '@context': 'https://schema.org', '@type': 'Dataset', name: title, description, url: `https://legalgrads.com${TRACKER_PATH}`, dateModified: POST_BAR.lastVerified, creator: { '@type': 'Organization', name: 'Legalgrads', url: 'https://legalgrads.com' }, isAccessibleForFree: true },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="font-display text-sm font-bold text-purple">Resources · For new attorneys</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">Passed the bar.<br /><span className="text-pink">Now what?</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">Swearing-in costs, first-year CLE, fee relief and UBE portability across {ALL_STATES.length} jurisdictions. One glance per state.</p>
      <p className="mt-3 text-sm text-ink/70">Checked against official sources · {prettyDate(POST_BAR.lastVerified)} · No sign-up</p>

      <KeyFindings states={ALL_STATES} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {POST_BAR_STATES.map((s) => (
          <Link key={s.slug} href={`${TRACKER_PATH}${s.slug}/`} data-testid={`tracker-card-${s.slug}`} className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 transition hover:-translate-y-0.5 sm:p-8">
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold text-navy">{s.name}</h2><span className="rounded-2xl bg-cream px-3 py-1 font-display text-sm font-bold text-navy">{s.abbr}</span></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ink/70">Upfront after the bar</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-navy">{range(s)}</p>
            <p className="mt-1 text-sm text-ink">{s.upfrontNote}</p>
            <p className="mt-6 font-display text-sm font-bold text-purple group-hover:underline">{s.slug === 'california' ? 'Open the swearing-in fee calculator →' : `See the full ${s.name} breakdown →`}</p>
          </Link>
        ))}
      </div>

      <section className="mt-14 rounded-3xl bg-white shadow-pill ring-1 ring-navy/5">
        <h2 className="px-6 pt-6 font-display text-xl font-extrabold text-navy">All {ALL_STATES.length} jurisdictions, side by side</h2>
        <NationalTable states={ALL_STATES} base={TRACKER_PATH} />
        <p className="px-6 pb-6 pt-2 text-xs text-ink/70">Every figure links back to an official bar or court source below. Ranges reflect swearing-in month or optional fees.</p>
      </section>

      <EmbedBox pageUrl={`https://legalgrads.com${TRACKER_PATH}`} title={title} />

      <section className="mt-10 rounded-3xl bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">Official sources</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {ALL_STATES.flatMap((s) => s.sources.slice(0, 2).map((src) => <li key={s.slug + src.url}><span className="font-semibold text-navy">{s.abbr}:</span> <a className="text-purple underline" href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a></li>))}
        </ul>
        <p className="mt-5 text-sm text-ink">Upfront cost excludes bar exam fees. Fees change, so confirm with your licensing body before you pay. General information, not legal advice.</p>
      </section>
    </div>
  );
}
