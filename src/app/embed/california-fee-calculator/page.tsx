import type { Metadata } from 'next';
import { SwearingInCalculator } from '@/components/postbar/SwearingInCalculator';
import { TRACKER_PATH, stateBySlug } from '@/lib/postBar';

const CA = `${TRACKER_PATH}california/`;
export const metadata: Metadata = { title: 'California Swearing-In Fee Calculator (embed)', robots: { index: false, follow: true }, alternates: { canonical: CA } };

export default function Embed() {
  return (
    <div className="fixed inset-0 z-[9999] overflow-auto bg-white px-2" data-testid="ca-embed-root">
      <SwearingInCalculator compact mcle={stateBySlug('california')?.mcle} />
      <p className="px-4 py-3 text-xs text-ink">Source: <a href={`https://legalgrads.com${CA}`} target="_blank" rel="noopener" className="font-bold text-purple underline">Legalgrads.com California Post-Bar Tracker</a></p>
    </div>
  );
}
