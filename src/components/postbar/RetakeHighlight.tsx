import Link from 'next/link';
import { TRACKER_PATH } from '@/lib/postBar';

export function RetakeHighlight() {
  return (
    <div className="space-y-4 text-ink" data-testid="retake-highlight">
      <p className="rounded-2xl bg-pink/10 p-4 text-navy ring-1 ring-pink/30">
        <b>48.3% passed</b> the July 2026 two-day General Bar Exam (3,838 of 7,942). First-time takers: 64.7%. Repeat takers: 14.1%. A score under 1390 is not passing. Scores went to applicants on October 30, 2026. The public pass list was set for November 2, 2026, at 8:00 a.m.
      </p>
      <p>California is not a UBE state. The essays do not travel as a UBE score, and California does not accept an MBE score transferred in.</p>
      <p>A California MBE score can be sent only to places on NCBE&apos;s accept list (updated June 3, 2026). <b className="text-navy">Florida is on that list.</b> Oklahoma is marked concurrent only. Michigan is reciprocal only. <b className="text-navy">Washington, D.C. and Colorado are not on that accept list.</b> They show up on a different NCBE page, the one for jurisdictions that let NCBE send their own scores out. That is not the same as accepting a California score.</p>
      <div className="rounded-2xl bg-cream p-4">
        <p className="font-display font-extrabold text-navy">February 2027 retake</p>
        <p className="mt-1">The exam is February 23 and 24, 2027. A general applicant pays <b>$878</b> plus <b>$153</b> to type on a laptop. Immediate repeaters who sat every July 2026 session: timely filing is November 13, 2026. Everyone else: timely filing is November 2, 2026.</p>
      </div>
      <p><Link className="font-semibold text-purple underline" href={`${TRACKER_PATH}california/retake/`}>Full retake deadlines, late fees, AccessLex limits, and the NCBE jurisdiction list</Link></p>
    </div>
  );
}
