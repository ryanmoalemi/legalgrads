import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { ListingPreview } from '@/components/ListingPreview';
import { SharePanel } from '@/components/SharePanel';
import { PageIntro } from '@/components/ui';
import { joinedLabel } from '@/lib/joined';

export function ForAttorneysView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageIntro
        kicker="For attorneys"
        title="Join free"
        body="Attorneys licensed in any U.S. state or DC can apply now. The listing is free. Your email stays private. Clients reach you through our secure contact form. Legalgrads takes no referral fee and no share of legal fees. Nothing goes live until we manually check your record with your state bar."
      />
      <p className="mt-4 inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{joinedLabel()}</p>
      <p className="mt-2 max-w-3xl text-sm text-ink">{joinedLabel()} is only the year you join Legalgrads. It is not a rating and not a benefit to clients.</p>
      <Link href="/join/" data-testid="founding-cta" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pink px-6 py-3 font-display text-base font-semibold text-white">
        Join free
      </Link>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['Free listing', 'You are not charged to be in the directory.'],
          ['Direct contact', 'Clients reach you through Legalgrads’ private contact form. Your email stays hidden.'],
          ['Bar check first', 'We publish a profile only after a person checks your record with your state bar.'],
        ].map(([title, body]) => (
          <li key={title} className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-ink">{body}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl font-extrabold">Practice areas on the application</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {SPECIALTIES.map((spec) => (
          <li key={spec.slug} className="flex items-center gap-3 rounded-3xl bg-white p-3">
            <img src={spec.icon} alt="" width={56} height={56} />
            <span>
              <span className="block font-display font-extrabold">{spec.name}</span>
              <span className="text-sm text-ink">{spec.examples}</span>
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl font-extrabold">What clients will see</h2>
      <p className="mt-2 text-sm text-ink">This sample uses your future listing, not a real attorney. Clients find the live card on Find an attorney after your state bar record is verified.</p>
      <div className="mt-4 max-w-xl">
        <ListingPreview
          sample
          name="Your name"
          cities="Oakland"
          areas={['Contracts', 'Real Estate']}
          bio="A short bio you write. Clients read it on Find an attorney."
          insured={false}
        />
      </div>
      <div className="mt-8">
        <SharePanel name="Your name" />
      </div>
      <section className="mt-10" aria-labelledby="attorney-faq">
        <h2 id="attorney-faq" className="font-display text-2xl font-extrabold">Attorney questions</h2>
        <div className="mt-4 space-y-4">
          <article className="rounded-3xl bg-white p-5">
            <h3 className="font-display text-lg font-extrabold">Is Legalgrads a referral service?</h3>
            <p className="mt-2 text-sm text-ink">No. Legalgrads is a free directory, not a lawyer referral service certified by any state bar. Clients browse the directory and message you through our private contact form. Legalgrads does not match, recommend, or refer clients.</p>
          </article>
          <article className="rounded-3xl bg-white p-5">
            <h3 className="font-display text-lg font-extrabold">Does Legalgrads share fees?</h3>
            <p className="mt-2 text-sm text-ink">No. Legalgrads takes no referral fee and no share of legal fees.</p>
          </article>
          <article className="rounded-3xl bg-white p-5">
            <h3 className="font-display text-lg font-extrabold">Who is responsible for ethics and advertising?</h3>
            <p className="mt-2 text-sm text-ink">You are. Your bio, photo, and contact details are your own advertising and must follow the rules of professional conduct in the state where you are licensed.</p>
          </article>
          <article className="rounded-3xl bg-white p-5">
            <h3 className="font-display text-lg font-extrabold">How is my information used?</h3>
            <p className="mt-2 text-sm text-ink">We use it to check your state bar record and, if that passes, to show the listing you wrote. Your email stays private. Clients reach you through our secure contact form. A phone number is public only if you choose that. Email ryan@legalgrads.com to change or remove a listing.</p>
          </article>
        </div>
      </section>
      <p className="mt-8 text-sm text-ink">
        Read the <Link className="font-semibold text-purple" href="/attorney-terms/">Attorney Terms</Link> before you apply. You are responsible for your own advertising. A future premium, if we offer one, will be a flat fee for visibility only.
      </p>
    </div>
  );
}
