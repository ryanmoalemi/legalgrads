import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { LEGAL_LINKS } from '@/lib/legal';
import { BRAND, CONTACT_EMAIL } from '@/lib/site';
import { PageIntro } from '@/components/ui';

export const HOW_STEPS = [
  ['Browse attorneys near you', 'Search published listings by state, city and practice area.'],
  ['Read their listing', 'The attorney wrote the bio. A listing is published only after Legalgrads manually checks their state bar license.'],
  ['Message them directly', 'Use the secure contact form. Your email stays private. Legalgrads takes no fee and is not part of the representation.'],
];
export const HOW_SUBTITLE = 'Clients browse and choose attorneys themselves. Legalgrads doesn’t match, recommend or refer.';

export function HowItWorksView() {
  const steps = HOW_STEPS;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="How it works" title="A directory, not a law firm" body={HOW_SUBTITLE} />
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
        <p className="mt-3 text-ink">A free directory listing after your state bar record is checked.</p>
      </div>
      <div className="mt-4 rounded-3xl bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold">Later, if we offer it</h2>
        <p className="mt-3 text-ink">A premium option would be a flat fee for extra visibility only. It will not be priced per introduction and it will not be a share of legal fees.</p>
      </div>
      <p className="mt-6 text-xs text-ink" data-testid="joined-footnote">The listing can show the year the attorney joined {BRAND}. That year is not a rating and not a benefit to clients.</p>
    </div>
  );
}

export function AboutView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="About" title={BRAND} body={`${BRAND} is a directory for newly licensed U.S. attorneys in all 50 states and DC. The company is not a law firm and does not give legal advice.`} />
      <h2 className="mt-8 font-display text-2xl font-extrabold">Two kinds of profiles</h2>
      <section className="mt-4 rounded-3xl bg-white p-5">
        <h3 className="font-display text-xl font-extrabold">Unclaimed public profiles</h3>
        <p className="mt-2 text-ink">These are live. They are built from official licensing rosters. A page shows the name, bar number, license status, and the admission date or year the regulator published. The attorney has not edited it. An admission date is the license date on that record. It is not a graduation date and not a bar exam date.</p>
      </section>
      <section className="mt-4 rounded-3xl bg-white p-5">
        <h3 className="font-display text-xl font-extrabold">Claimed profiles</h3>
        <p className="mt-2 text-ink">A Claimed profile is one the attorney has verified. Verification is an email confirmation code, then a manual review of the state bar record. The attorney can add a photo, a bio, and practice areas. {BRAND} does not rank or recommend either kind of profile.</p>
      </section>
      <p className="mt-4 text-ink">You can browse Unclaimed profiles now. A waitlist email is optional. It only sends a note about the directory. It is not required to read a profile.</p>
      <p className="mt-4 text-ink">Write to <a className="font-semibold text-purple" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </div>
  );
}

export function FaqView() {
  const items = [
    ['What is an Unclaimed profile?', 'An Unclaimed public profile is live and built from an official licensing roster. The attorney has not claimed it. It is not a recommendation. The admission date on the page is the date or year on that roster. It is not a graduation date and not an exam date.'],
    ['What is a Claimed profile?', 'A Claimed profile is verified by the attorney. We email a confirmation code, then a person reviews the state bar record before the attorney’s own bio and photo go on the page.'],
    ['When will I see attorneys?', 'Unclaimed public profiles are on the site now, grouped by state and city. Claimed profiles appear after the email code and the manual bar review. You do not need a waitlist to browse.'],
    ['Does Legalgrads take a cut?', 'No. The listing is free. Legalgrads takes no referral fee and no share of legal fees.'],
    ['What does the Joined year mean?', 'It is the calendar year that attorney joined Legalgrads. It is not a quality rating and not a benefit to clients.'],
    ['What does verification mean?', 'For a Claimed profile, the attorney uses an email confirmation code and a person checks the state bar record. It is not an instant badge and it is not a background-check product. An Unclaimed profile shows the roster record only.'],
    ['Who writes the listing?', 'The attorney does. They are responsible for their advertising, bio, and photo.'],
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
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-lg font-extrabold">{spec.name}</span>
                <span className="text-sm text-ink">Examples: {spec.examples}</span>
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
      <p className="mt-4 text-ink">Examples: {spec.examples}. Claimed profiles can list this area after email-code verification and a manual bar review. Unclaimed roster pages are grouped by city and do not list a practice area.</p>
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
