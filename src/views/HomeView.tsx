'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { SPECIALTIES } from '@/lib/catalog';
import { initDb, joinWaitlist, publicAttorneys } from '@/lib/db';
import { money, validEmail } from '@/lib/format';
import { toCard } from '@/lib/search';
import { previewState } from '@/lib/seed';
import { DemoMark } from '@/components/ui';
import { useDemo } from '@/components/DemoProvider';

const SHORTCUTS = ['contracts', 'start-a-business', 'real-estate', 'employment'];

export function HomeView() {
  const { rev } = useDemo();
  const preview = previewState();
  const [maya, setMaya] = useState(toCard(preview, 'user_maya'));
  const [jordan, setJordan] = useState(toCard(preview, 'user_jordan'));
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void initDb().then(() => {
      const cards = publicAttorneys({});
      setMaya(cards.find((c) => c.slug === 'maya-r') ?? toCard(previewState(), 'user_maya'));
      setJordan(cards.find((c) => c.slug === 'jordan-k') ?? toCard(previewState(), 'user_jordan'));
    });
  }, [rev]);

  function onWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      setDone(false);
      return;
    }
    setError('');
    void initDb().then(() => {
      joinWaitlist(email, 'client', 'homepage');
      setDone(true);
    });
  }

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-4">
        <div className="min-w-0">
          <h1 className="font-display text-[2.05rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy sm:text-5xl lg:text-[4.15rem] lg:leading-[0.98]">
            <span className="hand-underline">
              Fresh
              <svg viewBox="0 0 120 12" aria-hidden="true">
                <path d="M2 8 C 30 2, 70 2, 118 7" stroke="#7A00FF" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            out of law school.
            <span className="gradient-text mt-1 block">Ready to work for you.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink sm:text-xl">
            Hire newly licensed attorneys who are ready to build their practices.
          </p>
          <form onSubmit={onWaitlist} className="relative mt-6 flex max-w-xl items-center rounded-full bg-white p-1.5 shadow-pill">
            <span className="pl-3 text-navy" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B0B3B" strokeWidth="1.7">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 6.5L20.5 6.5" />
              </svg>
            </span>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <input id="waitlist-email" data-testid="waitlist-email" name="email" type="email" placeholder="Drop your email for early access" className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none" />
            <button type="submit" data-testid="waitlist-submit" className="shrink-0 rounded-full bg-pink px-4 py-3 font-display text-sm font-semibold text-white sm:px-5 sm:text-base">Join the list ✨</button>
          </form>
          {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
          {done ? <p role="status" className="mt-2 text-sm font-medium">You’re on the demo waitlist in this browser. No email was sent.</p> : null}
          <p className="mt-3 text-sm text-ink sm:text-base">
            Be the first to know when we launch. No <span className="hand-underline font-semibold text-navy">spam.
              <svg viewBox="0 0 80 10" aria-hidden="true"><path d="M2 7 C 20 2, 50 2, 78 6" stroke="#7A00FF" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </span>
          </p>
          <Link href="/find-lawyer/" data-testid="explore-demo" className="mt-4 inline-flex min-h-11 items-center font-display font-semibold text-purple">
            Explore interactive demo →
          </Link>
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
        <HeroArt mayaRate={maya?.hourlyRate ?? 150} jordanRate={jordan?.hourlyRate ?? 175} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8" aria-label="Benefits">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:divide-x md:divide-[#eadfce]">
          <Benefit testid="benefit-more-affordable" icon="/icons/benefits/more_affordable.svg" title="More Affordable" body="Get quality legal help at lower rates." />
          <Benefit testid="benefit-newly-licensed" icon="/icons/benefits/newly_licensed.svg" title="Newly Licensed" body="Work with recent law grads who are ready to build their practices." />
          <Benefit testid="benefit-verified" icon="/icons/benefits/verified_attorneys.svg" title="Verified Attorneys" body="All attorneys are licensed and background checked." />
          <Benefit testid="benefit-wide-range" icon="/icons/benefits/wide_range.svg" title="Wide Range of Help" body="From business to real estate to contracts and more." />
        </ul>
        <p className="mt-4 text-center text-xs text-ink">Benefit lines describe the product idea. Verification in this demo is simulated. No savings percentage is claimed. Profiles are fictional.</p>
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

function HeroArt({ mayaRate, jordanRate }: { mayaRate: number; jordanRate: number }) {
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
        <img src="/headshots/01_maya.png" alt="Fictional demo portrait of Maya R." className="h-44 w-full rounded-2xl object-cover object-top sm:h-56" />
        <span className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-navy shadow"><Cap /> Newly Licensed</span>
        <div className="flex items-start justify-between gap-2 px-1 pt-3">
          <div>
            <h2 className="font-display text-lg font-extrabold">Maya R., Esq.</h2>
            <p className="text-xs text-ink">Class of 2026 · UC Law</p>
          </div>
          <p className="font-display font-extrabold">{money(mayaRate)}/hr <DemoMark /></p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 px-1 pb-2">
          {['Contracts', 'Business Law', 'Real Estate'].map((tag) => (
            <span key={tag} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-[11px] font-semibold text-purple">{tag}</span>
          ))}
        </div>
        <Link href="/attorneys/maya-r/" className="absolute inset-0 rounded-[28px]" aria-label="View Maya R." />
      </article>
      <article className="absolute bottom-8 right-0 z-20 w-[72%] rotate-3 rounded-[28px] bg-white p-3 shadow-card">
        <img src="/headshots/02_jordan.png" alt="Fictional demo portrait of Jordan K." className="h-40 w-full rounded-2xl object-cover object-top sm:h-48" />
        <span className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-navy shadow"><Cap /> Newly Licensed</span>
        <div className="flex items-start justify-between gap-2 px-1 pt-3">
          <div>
            <h2 className="font-display text-lg font-extrabold">Jordan K., Esq.</h2>
            <p className="text-xs text-ink">Class of 2025 · NYU Law</p>
          </div>
          <p className="font-display font-extrabold">{money(jordanRate)}/hr <DemoMark /></p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1 px-1 pb-2">
          {['LLC Setup', 'Corporate Law', 'IP Law'].map((tag) => (
            <span key={tag} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-[11px] font-semibold text-purple">{tag}</span>
          ))}
        </div>
        <Link href="/attorneys/jordan-k/" className="absolute inset-0 rounded-[28px]" aria-label="View Jordan K." />
      </article>
      <p className="absolute bottom-0 right-6 z-30 -rotate-2 rounded-2xl bg-[#FFE14A] px-3 py-2 font-display text-sm font-extrabold shadow">⚖ Real lawyers.</p>
      <p className="absolute bottom-16 left-2 z-30 max-w-[9rem] font-hand text-lg font-bold text-mint">Fictional demo</p>
    </div>
  );
}

function Cap() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 10 12 5l10 5-10 5L2 10Z" fill="#7A00FF" />
    </svg>
  );
}
