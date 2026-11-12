'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PillList } from '@/components/PillList';
import { SPECIALTIES } from '@/lib/catalog';
import { HOW_STEPS, HOW_SUBTITLE } from '@/views/MarketingViews';
import { submitWaitlist } from '@/lib/applications';
import { validEmail } from '@/lib/format';
import { joinedLabel } from '@/lib/joined';

const SHORTCUTS = ['contracts', 'start-a-business', 'real-estate', 'employment'];

export type HomeState = { code: string; name: string; cities: string[] };

export function HomeView({ states }: { states: HomeState[] }) {
  const [heroState, setHeroState] = useState('');
  const cities = states.find((s) => s.code === heroState)?.cities ?? [];
  const [done, setDone] = useState('');
  const [mailto, setMailto] = useState('');
  const [error, setError] = useState('');

  async function onWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      setDone('');
      setMailto('');
      return;
    }
    setError('');
    const result = await submitWaitlist(email, 'homepage');
    setMailto(result.channel === 'mailto' ? result.mailto : '');
    setDone(result.channel === 'supabase'
      ? 'You’re on the list. We’ll email you occasional directory updates.'
      : 'We did not store this on a server. Send the email so your address is not lost.');
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-4">
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-purple">Fresh out of law school. Licensed near you.</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,8vw,3.25rem)] font-black leading-[1.05] tracking-[-0.03em] text-navy">Find a lawyer for your business.</h1>
          <p className="mt-4 max-w-xl text-lg text-ink sm:text-xl">
            Browse newly licensed attorneys. Explore the services and fees they choose to share, and contact them directly.
          </p>
          <form action="/find-lawyer/" method="get" role="search" aria-label="Find an attorney" data-testid="home-search" className="mt-6 grid max-w-xl gap-3 rounded-3xl bg-white p-4 shadow-card sm:grid-cols-2">
            <label className="lg-field"><span>Licensing state</span>
              <select name="state" className="lg-input" data-testid="home-state" value={heroState} onChange={(event) => setHeroState(event.target.value)}>
                <option value="">Any state</option>
                {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </label>
            <label className="lg-field"><span>Office city (optional)</span>
              <input name="city" className="lg-input" data-testid="home-city" list="home-city-options" autoComplete="off" placeholder={cities[0] || 'Any city'} />
              <datalist id="home-city-options">{cities.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
            <button type="submit" data-testid="home-find" className="lg-btn lg-btn--primary sm:col-span-2">Find an attorney</button>
            <p className="text-sm text-ink sm:col-span-2">Search by where the attorney is licensed and where their office is. Practice areas can be filtered only on profiles the attorney has claimed and confirmed.</p>
          </form>
          <p className="mt-4">
            <Link href="/claim/" data-testid="home-attorney-cta" className="font-display font-semibold text-purple underline">Attorneys: claim your free profile</Link>
          </p>
          <h2 className="mt-6 font-display text-base font-bold text-navy">Browse by practice area</h2>
          <ul className="mt-2 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
            {SHORTCUTS.map((slug) => {
              const spec = SPECIALTIES.find((s) => s.slug === slug)!;
              return (
                <li key={slug}>
                  <Link href={`/specialties/${slug}/`} data-testid={`specialty-${slug}`} className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-2 py-2 text-sm font-display font-semibold shadow-sm">
                    <img src={spec.icon} alt="" width={36} height={36} />
                    <span>{spec.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <HeroArt />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8" aria-label="Benefits">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:divide-x md:divide-[#eadfce]">
          <Benefit testid="benefit-more-affordable" icon="/icons/benefits/more_affordable.svg" title="Free to browse" body="Search the directory at no cost. No referral fee and no per-lead charge." />
          <Benefit testid="benefit-newly-licensed" icon="/icons/benefits/newly_licensed.svg" title="Newly Licensed" body="Built for lawyers in every state opening a practice after the bar." />
          <Benefit testid="benefit-verified" icon="/icons/benefits/verified_attorneys.svg" title="Verified Attorneys" body="A listing goes live only after a manual state bar check." />
          <Benefit testid="benefit-wide-range" icon="/icons/benefits/wide_range.svg" title="Wide Range of Help" body="Contracts, business, real estate, employment, and more." />
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4" aria-labelledby="browse-places" data-testid="home-browse">
        <h2 id="browse-places" className="font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Browse public profiles</h2>
        <p className="mt-2 max-w-2xl text-ink">Unclaimed profiles from official rosters, grouped by state and city.</p>
        <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
          {[
            ['/attorneys/ca/', 'California'],
            ['/attorneys/ca/los-angeles/', 'Los Angeles'],
            ['/attorneys/ca/san-francisco/', 'San Francisco'],
            ['/attorneys/ca/san-diego/', 'San Diego'],
            ['/attorneys/ny/', 'New York'],
            ['/attorneys/ny/new-york/', 'New York City'],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-display text-sm font-semibold text-navy shadow-sm">{label}</Link>
            </li>
          ))}
        </ul>
        <article className="mt-4 rounded-3xl bg-white p-5 shadow-card">
          <h3 className="font-display text-xl font-extrabold text-navy">Post-Bar Licensing Tracker</h3>
          <p className="mt-2 text-sm text-ink">Swearing-in costs and CLE for the states checked against official bar sources.</p>
          <Link href="/resources/post-bar-licensing-tracker/" className="mt-3 inline-flex min-h-11 items-center font-display text-sm font-semibold text-purple">Open the tracker</Link>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8" aria-labelledby="updates-heading" data-testid="home-updates">
        <form onSubmit={onWaitlist} className="grid max-w-xl gap-2 rounded-3xl bg-white p-5 shadow-card">
          <h2 id="updates-heading" className="font-display text-lg font-extrabold text-navy">Get directory updates</h2>
          <p className="text-sm text-ink">An occasional email when new attorneys or features are added. Optional; you do not need it to browse.</p>
          <label className="sr-only" htmlFor="waitlist-email">Email address</label>
          <div className="flex gap-2">
            <input id="waitlist-email" data-testid="waitlist-email" name="email" type="email" required placeholder="you@example.com" className="lg-input min-w-0 flex-1" />
            <button type="submit" data-testid="waitlist-submit" className="lg-btn lg-btn--secondary shrink-0">Get updates</button>
          </div>
          {error ? <p role="alert" className="lg-notice lg-notice--error">{error}</p> : null}
          {done ? <p role="status" data-testid="waitlist-status" className="text-sm font-medium">{done}</p> : null}
          {mailto ? <p className="text-sm"><a data-testid="waitlist-mailto" className="font-semibold text-purple" href={mailto}>Email this signup to ryan@legalgrads.com</a></p> : null}
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8" aria-labelledby="how-heading" data-testid="home-how">
        <h2 id="how-heading" className="font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">A directory, not a law firm</h2>
        <p className="mt-2 max-w-2xl text-ink">{HOW_SUBTITLE}</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {HOW_STEPS.map(([title, body], index) => (
            <li key={title} className="rounded-3xl bg-white px-4 py-4 shadow-card">
              <p className="font-display text-sm font-bold text-purple">Step {index + 1}</p>
              <h3 className="mt-1 font-display text-lg font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-ink">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4" aria-labelledby="for-attorneys-heading" data-testid="home-for-attorneys">
        <div className="rounded-[32px] bg-white p-6 shadow-card sm:p-8">
          <p className="inline-flex items-center rounded-full bg-[#F3E9FF] px-3 py-1 font-display text-xs font-bold text-purple">
            {joinedLabel()}
          </p>
          <h2 id="for-attorneys-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">For attorneys</h2>
          <p className="mt-2 max-w-2xl text-ink">A free listing, in any U.S. state. Legalgrads does not take a cut.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Free listing', 'You are not charged to appear in the directory.'],
              ['Checked by hand', 'Your listing goes live only after a manual check with your state bar.'],
              ['No referral fee', 'Legalgrads takes no referral fee and no share of legal fees.'],
            ].map(([title, body]) => (
              <li key={title} className="rounded-3xl bg-cream px-4 py-4">
                <h3 className="font-display text-lg font-extrabold">{title}</h3>
                <p className="mt-1 text-sm text-ink">{body}</p>
              </li>
            ))}
          </ul>
          <Link href="/join/" data-testid="home-apply" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-pink px-8 py-3 font-display text-base font-semibold text-white">
            Join free
          </Link>
        </div>
      </section>
    </div>
  );
}

function Benefit({ testid, icon, title, body }: { testid: string; icon: string; title: string; body: string }) {
  return (
    <li data-testid={testid} className="min-w-0 px-1 text-center md:px-4 md:text-left">
      <img src={icon} alt="" className="mx-auto h-14 w-14 md:mx-0 md:h-16 md:w-16" />
      <h2 className="mt-2 font-display text-sm font-extrabold leading-tight sm:text-lg">{title}</h2>
      <p className="mt-1 text-[11px] leading-snug text-ink sm:text-sm">{body}</p>
    </li>
  );
}

function HeroArt() {
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[520px] overflow-hidden sm:h-[540px] sm:overflow-visible">
      <div className="absolute left-6 top-16 h-56 w-56 rounded-full bg-pink/15 blur-2xl" aria-hidden="true" />
      <div className="absolute bottom-10 right-4 h-48 w-48 rounded-full bg-purple/15 blur-2xl" aria-hidden="true" />
      <svg className="absolute left-[8%] top-10 h-12 w-10 text-pink" viewBox="0 0 40 48" fill="none" aria-hidden="true">
        <path d="M20 4v18M12 10l8-6 8 6M14 28l6 14 6-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="absolute right-[6%] top-2 z-20 rotate-6 font-hand text-3xl font-bold text-mint sm:text-4xl">Fresh grads</p>
      <svg className="absolute right-[18%] top-12 z-20 h-16 w-16 text-mint" viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <path d="M70 10 C 40 10, 30 40, 18 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 58 l16 -2 l-6 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <SampleCard
        className="absolute left-0 top-14 z-10 w-[60%] -rotate-6"
        photo="sample-attorney-1"
        alt="Sample listing photo: smiling attorney in a dark blazer"
        title="Sample profile layout"
        place="Example location"
        tags={['Contracts', 'Business', 'Real Estate']}
      />
      <SampleCard
        className="absolute bottom-10 right-0 z-20 w-[58%] rotate-3"
        photo="sample-attorney-2"
        alt="Sample listing photo: smiling attorney in a gray suit and tie"
        title="Sample profile layout"
        place="Example location"
        tags={['Start a Business', 'Employment']}
      />
      <p className="absolute bottom-0 right-6 z-30 -rotate-2 rounded-2xl bg-[#FFE14A] px-3 py-2 font-display text-sm font-extrabold text-navy shadow" data-testid="hero-sample-note">Sample previews, not real attorneys</p>
    </div>
  );
}

function SampleCard({ className, photo, alt, title, place, tags }: { className: string; photo: string; alt: string; title: string; place: string; tags: string[] }) {
  return (
    <article className={`${className} rounded-[28px] bg-white p-3 shadow-card`} data-testid="hero-sample-card">
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={`/images/home/${photo}-480.webp`}
          srcSet={`/images/home/${photo}-480.webp 480w, /images/home/${photo}-800.webp 800w`}
          sizes="(min-width: 1024px) 380px, 72vw"
          width={480}
          height={338}
          alt={alt}
          className="h-44 w-full object-cover object-[center_30%] sm:h-52"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-2 py-1 text-xs font-bold uppercase tracking-wide text-purple shadow">Sample listing</span>
      </div>
      <div className="px-1 pt-3">
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        <p className="text-xs text-ink">{place}</p>
      </div>
      <PillList items={tags} className="mt-2 px-1 pb-1 text-[11px]" />
    </article>
  );
}
