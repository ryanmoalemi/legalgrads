'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { SPECIALTIES } from '@/lib/catalog';
import { HOW_STEPS, HOW_SUBTITLE } from '@/views/MarketingViews';
import { submitWaitlist } from '@/lib/applications';
import { validEmail } from '@/lib/format';
import { joinedLabel } from '@/lib/joined';

const SHORTCUTS = ['contracts', 'start-a-business', 'real-estate', 'employment'];

export function HomeView() {
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
      ? 'You’re on the list. We’ll email you when listings are published.'
      : 'We did not store this on a server. Send the email so your address is not lost.');
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-4">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(1.6rem,7.06vw,2.6rem)] font-black leading-[1.03] tracking-[-0.03em] text-navy sm:text-[2.75rem] lg:whitespace-nowrap lg:text-[clamp(2.5rem,4.3vw,3.1rem)] lg:leading-[1.03]">
            <span className="hand-underline">
              Fresh
              <svg viewBox="0 0 120 12" aria-hidden="true">
                <path d="M2 8 C 30 2, 70 2, 118 7" stroke="#7A00FF" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            out of law school.
            <span className="gradient-text mt-1 block">Licensed near you.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink sm:text-xl">
            Browse newly licensed attorneys near you, free. Every listing goes live only after a manual check with the attorney’s state bar.
          </p>
          <form onSubmit={onWaitlist} className="relative mt-6 flex max-w-xl items-center rounded-full bg-white p-1.5 shadow-pill">
            <span className="pl-3 text-navy" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B0B3B" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 6.5L20.5 6.5" />
              </svg>
            </span>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <input id="waitlist-email" data-testid="waitlist-email" name="email" type="email" required placeholder="Drop your email for early access" className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none" />
            <button type="submit" data-testid="waitlist-submit" className="shrink-0 rounded-full bg-pink px-4 py-3 font-display text-sm font-semibold text-white sm:px-5 sm:text-base">Join the list ✨</button>
          </form>
          {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
          {done ? <p role="status" data-testid="waitlist-status" className="mt-2 text-sm font-medium">{done}</p> : null}
          {mailto ? <p className="mt-2 text-sm"><a data-testid="waitlist-mailto" className="font-semibold text-purple" href={mailto}>Email this signup to ryan@legalgrads.com</a></p> : null}
          <Link href="/join/" data-testid="home-attorney-cta" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 font-display text-sm font-semibold text-navy shadow-pill ring-1 ring-navy/10">
            Attorneys: join free
          </Link>
          <p className="mt-3 text-sm text-ink sm:text-base">
            Be the first to know when attorneys are published. No <span className="hand-underline font-semibold text-navy">spam.
              <svg viewBox="0 0 80 10" aria-hidden="true"><path d="M2 7 C 20 2, 50 2, 78 6" stroke="#7A00FF" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SHORTCUTS.map((slug) => {
              const spec = SPECIALTIES.find((s) => s.slug === slug)!;
              return (
                <Link key={slug} href={`/find-lawyer/?specialty=${slug}`} data-testid={`specialty-${slug}`} className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-2 py-2 text-sm font-display font-semibold shadow-sm">
                  <img src={spec.icon} alt="" width={36} height={36} />
                  <span>{spec.name}</span>
                </Link>
              );
            })}
          </div>
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
      <article className="absolute left-0 top-16 z-10 w-[74%] -rotate-6 rounded-[28px] bg-white p-3 shadow-card">
        <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4EEFF] to-[#FFF1F8] sm:h-56">
          <img src="/logos/legalgrads_mark.svg" alt="" className="h-24 w-24" />
        </div>
        <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-navy shadow">{joinedLabel()}</span>
        <div className="px-1 pt-3">
          <h2 className="font-display text-lg font-extrabold">Your listing</h2>
          <p className="text-xs text-ink">All 50 states + DC · after a state bar check</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 px-1 pb-2">
          {['Contracts', 'Business', 'Real Estate'].map((tag) => (
            <span key={tag} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-[11px] font-semibold text-purple">{tag}</span>
          ))}
        </div>
      </article>
      <article className="absolute bottom-8 right-0 z-20 w-[72%] rotate-3 rounded-[28px] bg-white p-3 shadow-card">
        <div className="grid h-40 grid-cols-4 gap-2 rounded-2xl bg-[#FFF8F1] p-3 sm:h-48">
          {SPECIALTIES.slice(0, 8).map((spec) => (
            <img key={spec.slug} src={spec.icon} alt="" className="h-10 w-10 justify-self-center" />
          ))}
        </div>
        <div className="px-1 pt-3">
          <h2 className="font-display text-lg font-extrabold">Verified with the state bar</h2>
          <p className="text-xs text-ink">Every listing checked by hand.</p>
        </div>
      </article>
      <p className="absolute bottom-0 right-6 z-30 -rotate-2 rounded-2xl bg-[#FFE14A] px-3 py-2 font-display text-sm font-extrabold shadow">Real lawyers.</p>
    </div>
  );
}
