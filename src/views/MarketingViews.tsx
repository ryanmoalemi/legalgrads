import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { CONTACT_EMAIL } from '@/lib/catalog';

const STEPS = [
  { n: '1', title: 'Choose a Specialty', body: 'Tell us contracts, a new business, real estate, employment, or another area.', href: '/find-lawyer/', cta: 'Choose a specialty' },
  { n: '2', title: 'Compare New Lawyers', body: 'Review fictional profiles, demo rates, and services. Save the ones you want.', href: '/find-lawyer/results/', cta: 'Compare lawyers' },
  { n: '3', title: 'Request a Consultation', body: 'Send a non-confidential request. The attorney reviews conflicts before any engagement.', href: '/attorneys/maya-r/', cta: 'Request a consultation' },
  { n: '4', title: 'Get Legal Help', body: 'If you both accept terms, a demo matter opens. Messaging alone does not start representation.', href: '/client/dashboard/', cta: 'Open the client demo' },
];

const WHY = [
  ['Motivated', 'Newly licensed attorneys are building a practice and can be responsive.'],
  ['More Affordable', 'Demo rates are often lower than a long-established firm. No savings percentage is claimed.'],
  ['Fresh Perspectives', 'Recent graduates bring current coursework. They are not a substitute for specialist counsel when you need it.'],
  ['Wide Range of Help', 'Eight practice areas, from business formation to everyday contracts.'],
];

const FAQS = [
  ['Is Legalgrads a law firm?', 'No. It is a marketplace demo. Browsing or messaging does not create an attorney-client relationship.'],
  ['Are these attorneys real?', 'No. Names, schools, rates, reviews, and verification badges are fictional demo data.'],
  ['How are licenses checked?', 'In this demo, verification is simulated. A real launch would need primary-source bar checks.'],
  ['Why are some lawyers missing from search?', 'Pending verification, not-yet-admitted graduates, and attorneys outside the newly licensed window are not bookable.'],
  ['Does a message start representation?', 'No. The attorney reviews conflicts and sends terms. A matter starts when you accept.'],
  ['Will I be charged?', 'No. Payments are simulated and labeled “Demo payment — no money charged.”'],
  ['What state is my matter in?', 'You pick a jurisdiction. The demo will not match an attorney who is not licensed there.'],
  ['Who do I contact?', `Email ${CONTACT_EMAIL}. There is no phone number or mailing address in this demo.`],
];

export function HowView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-center font-display text-sm font-bold text-purple">Get affordable, newly licensed attorneys</p>
      <h1 className="mt-2 text-center font-display text-4xl font-extrabold sm:text-6xl">How Legalgrads works</h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-ink">Four steps. Every step is a working part of the demo.</p>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {STEPS.map((step) => (
          <li key={step.n} className="rounded-3xl bg-white p-5">
            <p className="font-display text-sm font-bold text-pink">{step.n}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">{step.title}</h2>
            <p className="mt-2 text-sm text-ink">{step.body}</p>
            <Link href={step.href} className="mt-3 inline-flex min-h-11 items-center font-display font-semibold text-purple">{step.cta} →</Link>
          </li>
        ))}
      </ol>
      <h2 className="mt-12 text-center font-display text-3xl font-extrabold">Why new lawyers?</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {WHY.map(([title, body]) => <li key={title} className="rounded-3xl bg-white p-4"><h3 className="font-display font-extrabold">{title}</h3><p className="mt-1 text-sm text-ink">{body}</p></li>)}
      </ul>
      <section className="mt-12">
        <h2 className="font-display text-3xl font-extrabold">FAQ</h2>
        {FAQS.map(([q, a]) => (
          <details key={q} className="mt-3 rounded-2xl bg-white p-4">
            <summary className="cursor-pointer font-display font-semibold">{q}</summary>
            <p className="mt-2 text-sm text-ink">{a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}

export function ForAttorneysView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="font-display text-sm font-bold text-purple">For attorneys</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight sm:text-6xl">Launch your legal career with clients.</h1>
          <p className="mt-4 text-lg text-ink">A platform built exclusively for newly licensed attorneys. The default demo window is three years from admission.</p>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            <li>Get in front of real clients in the product story. These profiles are fictional.</li>
            <li>Set your own demo rates and fixed-price services.</li>
            <li>Build your reputation. New profiles can have zero reviews.</li>
            <li>We handle the technology so you can focus on practice. We do not practice law for you.</li>
          </ul>
          <Link href="/attorney/onboarding/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pink px-5 font-display font-semibold text-white">Create your profile</Link>
        </div>
        <div className="relative mx-auto h-80 w-full max-w-sm">
          <img src="/headshots/02_jordan.png" alt="Fictional demo portrait used on the attorney page" className="mx-auto h-64 w-64 rounded-full object-cover object-top" />
          <p className="absolute left-0 top-8 rounded-2xl bg-white px-3 py-2 text-sm font-semibold shadow">Newly Licensed</p>
          <p className="absolute bottom-6 left-0 rounded-2xl bg-white px-3 py-2 text-sm shadow">Your practice starts here</p>
          <p className="absolute bottom-6 right-0 rounded-2xl bg-white px-3 py-2 text-sm shadow">Build clients</p>
        </div>
      </div>
      <p className="mt-8 text-sm text-ink">Bar admission is required before a profile can be public. A graduate waiting on admission can save a draft only. Verification in the demo is simulated.</p>
    </div>
  );
}

export function PricingView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="demo-pill">DRAFT · PROPOSED</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Pricing</h1>
      <p className="mt-3 text-ink">No fee is charged in this demo. There is no card form and no claim that clients save a percentage versus other lawyers.</p>
      <h2 className="mt-8 font-display text-2xl font-extrabold">What attorneys show</h2>
      <p className="mt-2 text-ink">Each fictional attorney sets an hourly demo rate and optional fixed-price services. Those numbers are made up. They are labeled DEMO wherever they appear.</p>
      <h2 className="mt-8 font-display text-2xl font-extrabold">A platform fee is not in effect</h2>
      <p className="mt-2 text-ink">One model under counsel review would be a flat subscription for attorney profiles, not a fee per referral and not a percentage of legal fees. That model is not turned on. It may not be allowed in every state. Do not treat this page as permission to fee-share.</p>
      <p className="mt-4 text-sm"><Link className="text-purple" href="/referral-disclosure/">Read the referral disclosure</Link></p>
    </div>
  );
}

export function AboutView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">About Legalgrads</h1>
      <p className="mt-3 text-ink">Legalgrads is a pitch demo for a marketplace where clients can find newly licensed attorneys. The product is not launched as a law firm, a referral service, or a payment platform.</p>
      <p className="mt-3 text-ink">The interactive pieces — search, intake, messaging, scheduling, engagements, and reviews — run in your browser on fictional records. Reset Demo puts the original seed data back.</p>
      <p className="mt-3 text-ink">Contact {CONTACT_EMAIL}. Coming soon is still the public status of the product. This site is the walkthrough partners can click through.</p>
    </div>
  );
}

export function FaqView() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">FAQ</h1>
      <div className="mt-4">
        {FAQS.map(([q, a]) => (
          <details key={q} className="mt-3 rounded-2xl bg-white p-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-sm text-ink">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function SpecialtiesView() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">Practice areas</h1>
      <p className="mt-2 text-ink">Eight areas. Choosing one opens intake with that area selected.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {SPECIALTIES.map((spec) => (
          <li key={spec.slug}><Link href={`/specialties/${spec.slug}/`} className="flex items-center gap-3 rounded-3xl bg-white p-4"><img src={spec.icon} alt="" width={56} height={56} /><span><span className="block font-display text-xl font-extrabold">{spec.name}</span><span className="text-sm text-ink">{spec.description}</span></span></Link></li>
        ))}
      </ul>
    </div>
  );
}

export function SpecialtyDetail({ slug }: { slug: string }) {
  const spec = SPECIALTIES.find((s) => s.slug === slug);
  if (!spec) return <p className="p-8">Unknown practice area.</p>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <img src={spec.icon} alt="" width={72} height={72} />
      <h1 className="mt-3 font-display text-4xl font-extrabold">{spec.name}</h1>
      <p className="mt-3 text-ink">{spec.description}</p>
      <p className="mt-2 text-sm text-ink">Examples: {spec.examples}. This is not legal advice.</p>
      <Link href={`/find-lawyer/?specialty=${spec.slug}`} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pink px-5 font-display font-semibold text-white">Start intake</Link>
    </div>
  );
}

export function NotFoundView() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-ink">That address is not part of the Legalgrads demo.</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pink px-5 font-display font-semibold text-white">Back home</Link>
    </div>
  );
}
