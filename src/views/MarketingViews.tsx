import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { LEGAL_LINKS } from '@/lib/legal';
import { CONTACT_EMAIL } from '@/lib/site';
import { PageIntro } from '@/components/ui';

export function HowItWorksView() {
  const steps = [
    ['Tell us you want a lawyer', 'Join the waitlist, or come back when published California listings are on the find page.'],
    ['Read a verified listing', 'A profile appears only after Legalgrads manually checks the California State Bar record. The attorney wrote the bio.'],
    ['Contact the attorney directly', 'Use the booking link on the listing. Legalgrads is not in the middle of the representation and does not take a fee.'],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="How it works" title="A directory, not a law firm" body="Consumers browse published attorneys. Attorneys apply separately and wait for a State Bar check." />
      <ol className="mt-8 space-y-4">
        {steps.map(([title, body], index) => (
          <li key={title} className="rounded-3xl bg-white p-5">
            <p className="font-display text-sm font-bold text-purple">Step {index + 1}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">{title}</h2>
            <p className="mt-2 text-ink">{body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm"><Link className="font-semibold text-purple" href="/for-attorneys/">Attorneys: Join free</Link></p>
    </div>
  );
}

export function PricingView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="Pricing" title="The listing is free" body="Legalgrads does not charge per lead and does not take a percentage of legal fees." />
      <div className="mt-8 rounded-3xl bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold">Free listing</h2>
        <p className="mt-2 text-4xl font-display font-extrabold">$0</p>
        <p className="mt-3 text-ink">A free directory listing after your California State Bar record is checked. The listing can show the year the attorney joined Legalgrads. That is not a rating and not a benefit to clients.</p>
      </div>
      <div className="mt-4 rounded-3xl bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold">Later, if we offer it</h2>
        <p className="mt-3 text-ink">A premium option would be a flat fee for extra visibility only. It will not be priced per introduction and it will not be a share of legal fees.</p>
      </div>
    </div>
  );
}

export function AboutView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="About" title="Legalgrads" body="Legalgrads is a directory for newly licensed California attorneys. The company is not a law firm and does not give legal advice." />
      <p className="mt-6 text-ink">Attorneys can apply before listings open to the public. Each public profile waits on a manual State Bar check. Consumers can join a waitlist in the meantime.</p>
      <p className="mt-4 text-ink">Write to <a className="font-semibold text-purple" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </div>
  );
}

export function FaqView() {
  const items = [
    ['When will I see attorneys?', 'The find page lists only published profiles. Until the first State Bar checks are finished, it shows a waitlist. California bar results are expected around October 30, 2026, and applications are open now.'],
    ['Does Legalgrads take a cut?', 'No. The listing is free. Legalgrads takes no referral fee and no share of legal fees.'],
    ['What does the Joined year mean?', 'It is the calendar year that attorney joined Legalgrads. It is not a quality rating and not a benefit to clients.'],
    ['What does verification mean?', 'A person checks the California State Bar record before a listing is published. It is not an instant badge and it is not a background-check product.'],
    ['Who writes the listing?', 'The attorney does. They are responsible for their advertising, rate, and photo.'],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="FAQ" title="Questions" />
      <div className="mt-8 space-y-4">
        {items.map(([title, body]) => (
          <section key={title} className="rounded-3xl bg-white p-5">
            <h2 className="font-display text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-ink">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function SpecialtiesView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageIntro kicker="Practice areas" title="What attorneys can list" body="These are the eight areas on the application. Published attorneys will show up here after verification." />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {SPECIALTIES.map((spec) => (
          <li key={spec.slug}>
            <Link href={`/specialties/${spec.slug}/`} className="flex items-center gap-3 rounded-3xl bg-white p-4">
              <img src={spec.icon} alt="" width={56} height={56} />
              <span>
                <span className="block font-display text-lg font-extrabold">{spec.name}</span>
                <span className="text-sm text-ink">{spec.examples}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpecialtyDetail({ slug }: { slug: string }) {
  const spec = SPECIALTIES.find((item) => item.slug === slug);
  if (!spec) return <div className="px-4 py-10">Unknown practice area.</div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <img src={spec.icon} alt="" width={72} height={72} />
      <PageIntro title={spec.name} body={spec.description} />
      <p className="mt-4 text-ink">Examples: {spec.examples}. Attorneys in this area appear on the find page only after a California State Bar check.</p>
      <p className="mt-4"><Link className="font-semibold text-purple" href={`/find-lawyer/?specialty=${spec.slug}`}>See the directory</Link></p>
    </div>
  );
}

export function LegalIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="Legalgrads" title="Legal" body="Legalgrads is not a law firm. These pages describe the directory." />
      <ul className="mt-6 space-y-2">
        {LEGAL_LINKS.map((item) => (
          <li key={item.href}><Link className="font-semibold text-purple" href={item.href}>{item.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function NotFoundView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <PageIntro title="That page is not here" body="Try the directory or the attorney application." />
      <p className="mt-4 flex gap-4">
        <Link className="font-semibold text-purple" href="/find-lawyer/">Find an attorney</Link>
        <Link className="font-semibold text-purple" href="/for-attorneys/">For attorneys</Link>
      </p>
    </div>
  );
}
