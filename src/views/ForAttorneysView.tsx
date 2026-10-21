import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { PageIntro } from '@/components/ui';

export function ForAttorneysView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageIntro
        kicker="For attorneys"
        title="Join free as a Founding Member"
        body="California attorneys can apply now. The listing is free. Legalgrads takes no referral fee and no share of legal fees. Nothing goes live until we manually check your State Bar record."
      />
      <Link href="/join/" data-testid="founding-cta" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pink px-6 py-3 font-display text-base font-semibold text-white">
        Join free as a Founding Member
      </Link>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['Free listing', 'Founding Members are not charged to be in the directory.'],
          ['Your rate', 'You choose a flat fee or an hourly amount. Clients contact you directly.'],
          ['Bar check first', 'We publish a profile only after a person checks the California State Bar record.'],
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
      <p className="mt-8 text-sm text-ink">
        Read the <Link className="font-semibold text-purple" href="/attorney-terms/">Attorney Terms</Link> before you apply. You are responsible for your own advertising. A future premium, if we offer one, will be a flat fee for visibility only.
      </p>
    </div>
  );
}
