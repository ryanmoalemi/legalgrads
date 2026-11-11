import type { Metadata } from 'next';
import { EmbedBox } from '@/components/postbar/EmbedBox';
import { HubTable, type HubRow } from '@/components/postbar/HubTable';
import { ALL_STATES, POST_BAR, TRACKER_PATH, prettyDate, range } from '@/lib/postBar';
import { CHECKED, NATIONAL_STATES, NOT_PUBLISHED, money, sourceKey, upfrontText } from '@/lib/nationalPostBar';
import { OfficialSource } from '@/components/postbar/OfficialSource';

const title = 'Post-Bar Licensing Costs in All 50 States and D.C. (2026-2027)';
const description = 'Swearing-in fees, first-year CLE, and UBE transfers for every state and D.C. Official sources only. Missing figures are marked Not published. Free to embed.';
export const metadata: Metadata = { title, description, alternates: { canonical: TRACKER_PATH }, openGraph: { title, description, url: TRACKER_PATH } };

function rows(): HubRow[] {
  const california = ALL_STATES.find((state) => state.slug === 'california');
  if (!california) throw new Error('California post-bar row missing');
  const ca: HubRow = {
    slug: california.slug,
    name: california.name,
    abbr: california.abbr,
    upfront: range(california),
    upfrontNote: california.upfrontNote,
    upfrontSort: california.upfront?.low ?? null,
    ube: california.ube,
    ubeShort: california.ubeShort,
    cle: california.firstYearCle.short,
    relief: california.feeReliefShort || NOT_PUBLISHED,
    feeRelief: california.feeRelief,
    under400: !!california.upfront && california.upfront.high < 400,
    inPerson: false,
  };
  const rest: HubRow[] = NATIONAL_STATES.map((state) => ({
    slug: state.slug,
    name: state.name,
    abbr: state.abbr,
    upfront: upfrontText(state),
    upfrontNote: state.upfrontNote,
    upfrontSort: state.upfront?.low ?? null,
    ube: state.ube,
    ubeShort: state.ubeShort,
    cle: state.firstYearCle.short,
    relief: state.feeReliefShort,
    feeRelief: state.feeRelief,
    under400: !!state.upfront && state.upfront.high < 400,
    inPerson: state.inPersonFirstYear,
  }));
  return [ca, ...rest];
}

export default function Page() {
  const table = rows();
  const priced = table.filter((row) => row.upfrontSort !== null);
  const highest = [...priced].sort((a, b) => {
    const high = (row: HubRow) => {
      const match = row.upfront.match(/\$([0-9,]+(?:\.[0-9]+)?)/g);
      if (!match) return 0;
      return Number(match[match.length - 1].replace(/[$,]/g, ''));
    };
    return high(b) - high(a);
  })[0];
  const zero = priced.filter((row) => row.upfront.startsWith('$0'));
  const withCle = table.filter((row) => row.cle !== NOT_PUBLISHED);
  const ube = table.filter((row) => row.ube);
  const publishedAverage = priced.length
    ? Math.round(priced.reduce((sum, row) => sum + (row.upfrontSort ?? 0), 0) / priced.length)
    : null;
  const chartMax = Math.max(...priced.map((row) => row.upfrontSort ?? 0), 1);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: title,
    description,
    url: `https://legalgrads.com${TRACKER_PATH}`,
    dateModified: CHECKED,
    creator: { '@type': 'Organization', name: 'Legalgrads', url: 'https://legalgrads.com' },
    isAccessibleForFree: true,
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="font-display text-sm font-bold text-purple">Resources · 50 states and D.C.</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">The cost of getting licensed</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">Swearing-in fees, first-year CLE, and UBE transfers. Every row opens a state page. No sign-up.</p>
      <p className="mt-3 text-sm text-ink/70">National rows checked {prettyDate(CHECKED)}. California row uses the California page, checked {prettyDate(POST_BAR.lastVerified)}.</p>

      <section className="mt-8 rounded-3xl bg-white p-4 shadow-pill ring-1 ring-navy/5 sm:p-6">
        <h2 className="font-display text-xl font-extrabold text-navy">All jurisdictions</h2>
        <p className="mt-1 text-sm text-ink">Sort any column. Filters use published figures only. A state with a blank fee does not count as under $400 or as a waiver.</p>
        <div className="mt-4">
          <HubTable rows={table} base={TRACKER_PATH} />
        </div>
        <div className="mt-6 rounded-2xl bg-cream p-4 text-sm text-ink" data-testid="methods">
          <h3 className="font-display text-base font-extrabold text-navy">Methods</h3>
          <p className="mt-2">Non-California rows were checked on {prettyDate(CHECKED)} against the state bar, court, or board page linked on that state, or against NCBE for UBE adoption and published passing scores. Some figures come from a written reply by the licensing body and are cited on that state's page as a source. California figures are the ones already published on the California page. {NOT_PUBLISHED} means the official page we opened did not state that figure. This tracker does not estimate a missing number. Louisiana uses public admission rules only and does not use an attorney roster. General information, not legal advice.</p>
        </div>
      </section>

      <section className="mt-8" data-testid="key-findings">
        <h2 className="font-display text-2xl font-extrabold text-navy">What the published figures show</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-navy p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Highest published upfront</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{highest ? highest.name : NOT_PUBLISHED}</p>
            <p className="mt-1 text-sm text-white/80">{highest ? highest.upfront : ''}</p>
          </div>
          <div className="rounded-3xl bg-mint/15 p-5 text-navy">
            <p className="text-xs font-bold uppercase tracking-wide text-navy/70">$0 path published</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{zero.length} of {table.length}</p>
            <p className="mt-1 text-sm">{zero.map((row) => row.abbr).join(', ') || 'None'}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 text-navy shadow-card ring-1 ring-navy/5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/70">Average of published upfront lows</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{publishedAverage === null ? NOT_PUBLISHED : money(publishedAverage)}</p>
            <p className="mt-1 text-sm text-ink">{priced.length} of {table.length} jurisdictions have a number. This is not a 51-jurisdiction average.</p>
          </div>
          <div className="rounded-3xl bg-pink p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">UBE transfers</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{ube.length} of {table.length}</p>
            <p className="mt-1 text-sm text-white/80">{withCle.length} rows have a published first-year CLE note.</p>
          </div>
        </div>
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy/5" data-testid="hub-chart">
          <h3 className="font-display text-lg font-extrabold text-navy">Published upfront lows</h3>
          <p className="mt-1 text-sm text-ink">Bar length is the low end of the published range. California includes moral character plus the first license fee, so it is not the same kind of bill as a state that publishes only dues.</p>
          <ul className="mt-4 space-y-2">
            {[...priced].sort((a, b) => (b.upfrontSort ?? 0) - (a.upfrontSort ?? 0)).map((row) => (
              <li key={row.abbr} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-sm">
                <span className="font-bold text-navy">{row.abbr}</span>
                <span className="h-3 rounded-full bg-cream"><span className="block h-3 rounded-full bg-purple" style={{ width: `${Math.max(4, ((row.upfrontSort ?? 0) / chartMax) * 100)}%` }} /></span>
                <span className="font-display font-extrabold text-navy">{row.upfront}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EmbedBox pageUrl={`https://legalgrads.com${TRACKER_PATH}`} title={title} />

      <section className="mt-10 rounded-3xl bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">Official sources</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {NATIONAL_STATES.flatMap((state) => state.sources.slice(0, 2).map((src) => (
            <li key={state.abbr + sourceKey(src)}><span className="font-semibold text-navy">{state.abbr}:</span> <OfficialSource src={src} /></li>
          )))}
        </ul>
        <p className="mt-5 text-sm text-ink">Confirm a fee with the licensing body before you pay. General information, not legal advice.</p>
      </section>
    </div>
  );
}
