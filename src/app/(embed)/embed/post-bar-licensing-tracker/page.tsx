import type { Metadata } from 'next';
import { HubTable, type HubRow } from '@/components/postbar/HubTable';
import { ALL_STATES, TRACKER_PATH, prettyDate, range } from '@/lib/postBar';
import { CHECKED, NATIONAL_STATES, NOT_PUBLISHED, upfrontText } from '@/lib/nationalPostBar';

export const metadata: Metadata = { title: 'Post-Bar Licensing Tracker (embed)', robots: { index: false, follow: true }, alternates: { canonical: TRACKER_PATH } };

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
  return [ca, ...NATIONAL_STATES.map((state) => ({
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
  }))];
}

export default function Embed() {
  return (
    <div className="bg-white" data-testid="embed-root">
      <div className="px-2 pt-3"><p className="px-4 font-display text-lg font-extrabold text-navy">Post-bar licensing costs and 1st-year CLE, 2026-2027</p></div>
      <div className="px-4">
        <HubTable rows={rows()} base={`https://legalgrads.com${TRACKER_PATH}`} />
      </div>
      <p className="border-t border-navy/5 px-6 py-3 text-xs text-ink">
        Source: <a href={`https://legalgrads.com${TRACKER_PATH}`} target="_blank" rel="noopener" className="font-bold text-purple underline">LegalGrads.com</a> · Checked {prettyDate(CHECKED)}
      </p>
    </div>
  );
}
