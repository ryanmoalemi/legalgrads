import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRACKER_PATH, prettyDate } from '@/lib/postBar';
import { NATIONAL_STATES, NOT_PUBLISHED, nationalBySlug, upfrontText } from '@/lib/nationalPostBar';

export const dynamicParams = false;
export function generateStaticParams() {
  return NATIONAL_STATES.map((state) => ({ state: state.slug }));
}

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = nationalBySlug((await params).state);
  if (!state) return {};
  return { title: `${state.name} post-bar facts (embed)`, robots: { index: false, follow: true } };
}

export default async function Page({ params }: Props) {
  const state = nationalBySlug((await params).state);
  if (!state) notFound();
  const page = `https://legalgrads.com${TRACKER_PATH}${state.slug}/`;
  return (
    <div className="bg-white p-4" data-testid="state-embed">
      <p className="font-display text-lg font-extrabold text-navy">{state.name} after the bar, 2026-2027</p>
      <dl className="mt-3 grid gap-2 text-sm text-navy">
        <div className="flex justify-between gap-3"><dt>Upfront</dt><dd className="font-bold">{upfrontText(state)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Year 1 CLE</dt><dd className="text-right font-bold">{state.firstYearCle.short}</dd></div>
        <div className="flex justify-between gap-3"><dt>UBE transfers</dt><dd className="font-bold">{state.ubeShort}</dd></div>
        <div className="flex justify-between gap-3"><dt>July 2026 results</dt><dd className="font-bold">{state.resultsRelease}</dd></div>
        <div className="flex justify-between gap-3"><dt>Pass rate</dt><dd className="font-bold">{state.passRate}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-ink">Data through {prettyDate(state.lastVerified)}. {NOT_PUBLISHED} means the official source did not state the figure.</p>
      <p className="mt-2 text-center text-xs text-ink">Source: <a className="font-bold text-purple underline" href={page}>LegalGrads.com</a></p>
    </div>
  );
}
