import Link from 'next/link';
import { PageIntro } from '@/components/ui';
import { SPONSORED_LABEL } from '@/lib/legal';

const FREE = [
  'Claiming your profile and confirming it with an email code.',
  'Your photo and a short bio.',
  'The services you offer, the kinds of clients you work with, and your practice areas.',
  'Your consultation options, how you bill, and optional fixed fees.',
  'Your availability, phone number, website, and preferred contact method.',
  'A request form on your profile. Requests from business owners are emailed to you.',
  'Private stats for your profile: views, website clicks, contact clicks, and delivered requests.',
];

const NEVER = [
  'Charge you to claim, keep, or edit your standard listing.',
  'Charge you per lead, take a referral fee, or take a share of your legal fees.',
  'Sell ranking in directory results. Standard listings are ordered by neutral rules such as location and name.',
  'Hide or downgrade your standard listing because you did not buy something.',
];

export function FreeListingPromiseView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="For attorneys" title="Our free listing promise" body="Every attorney on LegalGrads gets a standard listing that is free for life. You never pay for your standard listing." />
      <Link href="/join/" data-testid="promise-claim" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-pinkdark px-6 font-display text-base font-semibold text-white">Claim my free profile</Link>
      <section className="mt-10 rounded-3xl bg-white p-5 shadow-pill">
        <h2 className="font-display text-2xl font-extrabold">Free for life</h2>
        <ul className="mt-3 grid gap-2 text-ink">
          {FREE.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="font-bold text-[#007A63]">✓</span><span>{item}</span></li>)}
        </ul>
      </section>
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-pill">
        <h2 className="font-display text-2xl font-extrabold">What we will never do</h2>
        <ul className="mt-3 grid gap-2 text-ink">
          {NEVER.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="font-bold text-navy">×</span><span>{item}</span></li>)}
        </ul>
      </section>
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-pill">
        <h2 className="font-display text-2xl font-extrabold">Sponsored placements</h2>
        <p className="mt-3 leading-7 text-ink">Optional sponsored placements may be offered in the future. If they are, they will be a flat fee for extra visibility only, never priced per lead or as a share of legal fees. {SPONSORED_LABEL} You will never need one to keep your standard listing.</p>
      </section>
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-pill">
        <h2 className="font-display text-2xl font-extrabold">Already have a profile?</h2>
        <p className="mt-3 leading-7 text-ink">Open your profile page and choose Claim my free profile, or start from the button below with your state and bar number. Questions go to <a className="font-semibold text-purple underline" href="mailto:ryan@legalgrads.com">ryan@legalgrads.com</a>.</p>
        <Link href="/join/" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-pinkdark px-6 font-display text-base font-semibold text-white">Claim my free profile</Link>
        <p className="mt-4 text-sm"><Link className="font-semibold text-purple underline" href="/attorney-terms/">Attorney Terms</Link></p>
      </section>
    </div>
  );
}
