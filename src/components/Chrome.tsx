'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { useDemo } from './DemoProvider';
import { DEMO_USERS } from '@/lib/catalog';
import { DEMO_IDS } from '@/lib/catalog';
import { resetDemo } from '@/lib/db';
import { readConsent, writeConsent } from '@/lib/consent';
import { cx } from '@/lib/format';

const NAV = [
  { href: '/find-lawyer/', label: 'Find a Lawyer' },
  { href: '/how-it-works/', label: 'How It Works' },
  { href: '/for-attorneys/', label: 'For Attorneys' },
];

export function DemoBar() {
  const { ready, user, switchUser } = useDemo();
  const [note, setNote] = useState('');

  return (
    <div className="sticky top-0 z-50 border-b border-navy/10 bg-navy text-white" data-testid="demo-banner">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2 text-sm">
        <p className="font-display font-semibold">Interactive demo, fictional data</p>
        <span className={ready ? '' : 'sr-only'} data-testid="app-ready" />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button type="button" data-testid="role-client" className={cx('min-h-11 rounded-full px-3 py-2 font-display text-xs font-semibold', user?.id === DEMO_IDS.client ? 'bg-white text-navy' : 'bg-white/10')} onClick={() => switchUser(DEMO_IDS.client)}>Client</button>
          <button type="button" data-testid="role-attorney" className={cx('min-h-11 rounded-full px-3 py-2 font-display text-xs font-semibold', user?.id === DEMO_IDS.attorney ? 'bg-white text-navy' : 'bg-white/10')} onClick={() => switchUser(DEMO_IDS.attorney)}>Attorney</button>
          <button type="button" data-testid="role-admin" className={cx('min-h-11 rounded-full px-3 py-2 font-display text-xs font-semibold', user?.id === DEMO_IDS.admin ? 'bg-white text-navy' : 'bg-white/10')} onClick={() => switchUser(DEMO_IDS.admin)}>Admin</button>
          <button
            type="button"
            data-testid="reset-demo"
            className="min-h-11 rounded-full bg-pink px-3 py-2 font-display text-xs font-semibold"
            onClick={() => {
              void resetDemo().then(() => setNote('Demo data restored'));
            }}
          >
            Reset Demo
          </button>
          <label className="sr-only" htmlFor="demo-user">Demo user</label>
          <select
            id="demo-user"
            data-testid="demo-user-select"
            aria-label="Demo user"
            className="min-h-11 max-w-[11rem] rounded-full bg-white/10 px-2 text-xs"
            value={user?.id ?? ''}
            onChange={(event) => switchUser(event.target.value || null)}
          >
            <option value="">Guest</option>
            {DEMO_USERS.map((row) => (
              <option key={row.id} value={row.id}>{row.label}</option>
            ))}
          </select>
        </div>
        {note ? <p data-testid="reset-status" role="status" className="w-full text-xs text-mint">{note}</p> : null}
        {user ? <p className="w-full text-xs text-white/80">Viewing as {user.name} · {user.role} · fictional</p> : null}
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { user } = useDemo();
  useEffect(() => setOpen(false), [path]);
  const dash = user?.role === 'attorney' ? '/attorney/dashboard/' : user?.role === 'admin' ? '/admin/' : '/client/dashboard/';

  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <Link href="/" aria-label="Legalgrads home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="font-display text-sm font-semibold text-navy/80 hover:text-navy">{item.label}</Link>
          ))}
          <Link href={user ? dash : '/login/'} className="font-display text-sm font-semibold text-navy">{user ? 'Dashboard' : 'Log in'}</Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F3E9FF] px-4 py-2 font-display text-sm font-semibold text-purple">
            <Rocket /> Coming soon
          </span>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E9FF] px-3 py-2 font-display text-xs font-semibold text-purple">
            <Rocket /> Coming soon
          </span>
          <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-navy" aria-label="Menu" aria-expanded={open} data-testid="nav-toggle" onClick={() => setOpen((v) => !v)}>
            <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
              <path d="M1 2h24M1 10h24M1 18h24" stroke="#0B0B3B" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <nav className="mx-4 mb-3 rounded-3xl bg-white p-4 shadow-card lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-2xl px-3 py-3 font-display font-semibold">{item.label}</Link>
          ))}
          <Link href={user ? dash : '/login/'} className="block rounded-2xl px-3 py-3 font-display font-semibold">{user ? 'Dashboard' : 'Log in'}</Link>
          <Link href="/specialties/" className="block rounded-2xl px-3 py-3 font-display font-semibold">Practice Areas</Link>
        </nav>
      ) : null}
    </header>
  );
}

function Rocket() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 4c3 1 5 4 6 7-3 1-6 1-8 0-1-2-1-5 2-7Z" stroke="#7A00FF" strokeWidth="1.7" />
      <path d="M9 15 4 20M8 10 4 9l2 4M14 16l1 4-4-2" stroke="#7A00FF" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const FOOTER = [
  ['Product', [
    ['/find-lawyer/', 'Find a Lawyer'],
    ['/specialties/', 'Practice Areas'],
    ['/how-it-works/', 'How It Works'],
    ['/pricing/', 'Pricing'],
    ['/about/', 'About'],
    ['/faq/', 'FAQ'],
    ['/contact/', 'Contact'],
  ]],
  ['Attorneys', [
    ['/for-attorneys/', 'For Attorneys'],
    ['/attorney/onboarding/', 'Create your profile'],
    ['/attorney-advertising/', 'Attorney advertising'],
    ['/referral-disclosure/', 'Referral disclosure'],
  ]],
  ['Legal', [
    ['/legal/', 'Legal'],
    ['/terms/', 'Terms'],
    ['/privacy/', 'Privacy'],
    ['/cookies/', 'Cookies'],
    ['/cookie-settings/', 'Cookie settings'],
    ['/disclaimers/', 'Disclaimers'],
    ['/accessibility/', 'Accessibility'],
  ]],
  ['Privacy', [
    ['/do-not-sell-or-share/', 'Do not sell or share'],
    ['/privacy-request/', 'Privacy request'],
    ['/data-deletion/', 'Data deletion'],
    ['/security/', 'Security'],
    ['/report-abuse/', 'Report abuse'],
  ]],
] as const;

export function Footer() {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo variant="white" />
          <p className="mt-4 text-sm text-white/75">A pitch demo for hiring newly licensed attorneys. Fictional data. Not a law firm.</p>
          <p className="mt-3 text-sm"><a className="underline" href="mailto:ryan@legalgrads.com">ryan@legalgrads.com</a></p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <h2 className="font-display text-sm font-bold">{title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {links.map(([href, label]) => (
                <li key={href}><Link className="hover:text-white" href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">© 2026 Legalgrads. Draft policies. Demo only.</p>
    </footer>
  );
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!readConsent());
  }, []);
  if (!open) return null;

  function choose(analytics: boolean, marketing: boolean) {
    writeConsent({ analytics, marketing });
    setOpen(false);
  }

  return (
    <div data-testid="cookie-banner" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-3xl bg-white p-4 shadow-card" role="dialog" aria-label="Cookie consent">
      <p className="font-display font-bold">Cookies in this demo</p>
      <p className="mt-1 text-sm text-ink">Strictly necessary storage is always on. Analytics and marketing stay off unless you opt in. No third-party tracker is loaded either way.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" data-testid="cookie-accept" className="min-h-11 rounded-full bg-navy px-4 py-2 font-display text-sm font-semibold text-white" onClick={() => choose(true, true)}>Accept</button>
        <button type="button" data-testid="cookie-reject" className="min-h-11 rounded-full bg-cream px-4 py-2 font-display text-sm font-semibold" onClick={() => choose(false, false)}>Reject optional</button>
        <Link href="/cookie-settings/" data-testid="cookie-customize" className="inline-flex min-h-11 items-center rounded-full px-4 py-2 font-display text-sm font-semibold text-purple" onClick={() => setOpen(false)}>Customize</Link>
      </div>
    </div>
  );
}
