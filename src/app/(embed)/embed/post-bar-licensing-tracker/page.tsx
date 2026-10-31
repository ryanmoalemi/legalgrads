import type { Metadata } from 'next';
import { ALL_STATES, POST_BAR, TRACKER_PATH, prettyDate } from '@/lib/postBar';
import { NationalTable } from '@/components/postbar/NationalTable';

export const metadata: Metadata = { title: 'Post-Bar Licensing Tracker (embed)', robots: { index: false, follow: true }, alternates: { canonical: TRACKER_PATH } };

export default function Embed() {
  return (
    <div className="bg-white" data-testid="embed-root">
      <div className="px-2 pt-3"><p className="px-4 font-display text-lg font-extrabold text-navy">Post-bar licensing costs and 1st-year CLE, 2026-2027</p></div>
      <NationalTable states={ALL_STATES} base={`https://legalgrads.com${TRACKER_PATH}`} embed />
      <p className="border-t border-navy/5 px-6 py-3 text-xs text-ink">
        <a href={`https://legalgrads.com${TRACKER_PATH}`} target="_blank" rel="noopener" className="font-bold text-purple underline">Verified by Legalgrads.com</a> · Official sources checked {prettyDate(POST_BAR.lastVerified)}
      </p>
    </div>
  );
}
