import type { Metadata } from 'next';
import Link from 'next/link';
import { JulyRetake } from '@/components/postbar/JulyRetake';
import { TRACKER_PATH } from '@/lib/postBar';

const path = `${TRACKER_PATH}california/retake/`;
export const metadata: Metadata = {
  title: 'February 2027 California Bar Retake Costs, Deadlines, and MBE Transfers',
  description: 'February 2027 California bar retake fees, immediate-repeater deadlines, and the NCBE list of places that accept a transferred MBE score. California is not a UBE state.',
  alternates: { canonical: path },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <nav className="text-sm text-ink"><Link className="font-semibold text-purple underline" href={`${TRACKER_PATH}california/`}>California post-bar tracker</Link> / Retake</nav>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">Scored under 1390 on the July 2026 bar?</h1>
      <p className="mt-3 text-lg text-ink">February 2027 retake costs, deadlines, and where a California MBE score can be sent. Pass rates by school are not posted yet.</p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8">
        <JulyRetake />
      </div>
    </div>
  );
}
