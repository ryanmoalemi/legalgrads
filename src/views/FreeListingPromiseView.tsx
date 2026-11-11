import Link from 'next/link';
import { PageIntro } from '@/components/ui';

const button = 'inline-flex min-h-12 items-center rounded-full bg-pinkdark px-6 font-display text-base font-semibold text-white';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-pill">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <div className="mt-3 grid gap-3 leading-7 text-ink">{children}</div>
    </section>
  );
}

export function FreeListingPromiseView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="Our free listing promise" title="Your listing is free. Always." body="You will never have to pay to claim, publish, or maintain your standard LegalGrads profile." />
      <Link href="/join/" data-testid="promise-claim" className={`mt-6 ${button}`}>Claim my free profile</Link>
      <Section title="What your free listing includes">
        <p>Your free listing includes your photo, biography, services, fee and consultation information, and contact options. You can update that information and receive and respond to inquiries through the standard contact features without a listing subscription or per-inquiry fee.</p>
        <p>There is no trial to expire and no renewal fee. Your listing does not become a paid product as your practice grows.</p>
        <p>You also get private stats for your profile: recorded profile views, website clicks, contact clicks, and delivered inquiries. Only you can see them.</p>
      </Section>
      <Section title="What might cost money in the future?">
        <p>We may introduce optional sponsored placements for attorneys who want additional visibility. Choosing a sponsored placement will be entirely up to you. You will never need to buy one to keep your standard listing or its included contact features.</p>
        <p>Paid placements will be clearly labeled as sponsored advertisements. Paying for placement will not mean that LegalGrads recommends a lawyer or rates that lawyer more highly.</p>
      </Section>
      <Section title="What does “always free” cover?">
        <p>This promise applies to the standard listing and features described above for as long as LegalGrads operates its directory. Profiles must meet our licensing, eligibility, and content requirements.</p>
        <p>The free listing promise concerns LegalGrads’ charges to attorneys. Attorneys set their own legal fees and consultation terms.</p>
      </Section>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/join/" className={button}>Claim my free profile</Link>
        <Link className="font-semibold text-purple underline" href="/attorney-terms/">Attorney Terms</Link>
        <a className="font-semibold text-purple underline" href="mailto:ryan@legalgrads.com">ryan@legalgrads.com</a>
      </div>
    </div>
  );
}
