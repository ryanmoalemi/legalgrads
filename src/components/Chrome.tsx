'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { readConsent, writeConsent } from '@/lib/consent';
import { needsAnalyticsConsent } from '@/lib/consent-region';
import { CONTACT_EMAIL } from '@/lib/site';
import { claimHref, normalizeProfilePath } from '@/lib/claim';

import SITE_NAV from '@/data/site-nav.json';

const NAV = SITE_NAV.primary as [string, string][];
const FOOTER = SITE_NAV.footer as [string, [string, string][]][];

/** Header claim action: the visitor's selected profile when the page carries ?profile=, otherwise the claim lookup. */
function useHeaderClaimHref(path: string): string {
  const [href, setHref] = useState('/claim/');
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('profile');
    const profile = normalizeProfilePath(raw);
    setHref(profile ? claimHref(profile) : '/claim/');
  }, [path]);
  return href;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /> : <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '/';
  const claim = useHeaderClaimHref(path);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    }
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <header className="lg-header" data-lg-header="1">
      <div className="lg-container lg-header__inner">
        <Link href="/" aria-label="LegalGrads home" className="lg-home">
          <Logo />
        </Link>
        <button
          ref={button}
          type="button"
          className="lg-menu-toggle"
          aria-expanded={open}
          aria-controls="lg-menu"
          data-testid="nav-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
          <span className="lg-sr">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
        <div ref={menu} id="lg-menu" className={`lg-menu${open ? ' is-open' : ''}`}>
          <nav className="lg-nav" aria-label="Primary">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} aria-current={path === href || path === href.replace(/\/$/, '') ? 'page' : undefined}>{label}</Link>
            ))}
          </nav>
          <a href={claim} data-testid="nav-claim" className="lg-btn lg-btn--secondary">{SITE_NAV.claimLabel}</a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="lg-footer" data-lg-footer="1">
      <div className="lg-container">
        <div className="lg-footer__grid">
          <div className="lg-footer__about">
            <Logo variant="white" />
            <p>{SITE_NAV.footerNote}</p>
            <p><a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
          <nav aria-label="Footer" className="lg-footer__links">
            {FOOTER.map(([title, links]) => (
              <div key={title}>
                <h2>{title}</h2>
                {links.map(([href, label]) => (
                  <Link key={href} href={href}>{label}</Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <p className="lg-footer__copy">{SITE_NAV.copyright}</p>
      </div>
    </footer>
  );
}

export function Footer() {
  const path = usePathname() || '';
  const join = path === '/join' || path.startsWith('/join/');
  if (join) return <JoinFooter reserveActionBar={!path.includes('confirmation')} />;
  return <SiteFooter />;
}

function JoinFooter({ reserveActionBar }: { reserveActionBar: boolean }) {
  return (
    <>
      <footer data-testid="join-footer" className="px-4 py-6 text-center text-sm text-ink">
        <p>© 2026 LegalGrads · <Link className="font-semibold text-purple underline" href="/terms/">Terms</Link> · <Link className="font-semibold text-purple underline" href="/privacy/">Privacy</Link> · <Link className="font-semibold text-purple underline" href="/legal/">Legal</Link> · <a className="font-semibold text-purple underline" href={`mailto:${CONTACT_EMAIL}`}>Support</a></p>
      </footer>
      {reserveActionBar ? <div className="join-footer-pad" aria-hidden="true" /> : null}
    </>
  );
}

export function CookieBanner() {
  const path = usePathname() || '';
  const joinStep = path === '/join' || path === '/join/';
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!readConsent() && needsAnalyticsConsent());
  }, []);
  useEffect(() => {
    if (!open) {
      delete document.body.dataset.cookieOpen;
      return;
    }
    document.body.dataset.cookieOpen = 'true';
    return () => {
      delete document.body.dataset.cookieOpen;
    };
  }, [open]);
  if (!open) return null;

  function choose(analytics: boolean) {
    writeConsent({ analytics, marketing: false });
    setOpen(false);
  }

  return (
    <div
      data-testid="cookie-banner"
      className={`cookie-banner rounded-3xl bg-white p-3 shadow-card ${joinStep ? 'cookie-banner-join' : ''}`}
      role="dialog"
      aria-label="Cookie consent"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <p id="cookie-banner-title" className="font-display text-sm font-bold cookie-join-hide">Cookies</p>
      <p className="cookie-join-short text-ink">Analytics stay off unless you accept.</p>
      <p id="cookie-banner-desc" className="mt-1 text-sm text-ink cookie-join-hide">
        Analytics cookies help us count visits. They stay off in your region until you choose. Marketing stays off unless you opt in. You can change this later.
      </p>
      <div className="cookie-actions mt-3 flex flex-wrap items-center gap-2">
        <button type="button" data-testid="cookie-accept" className="cookie-choice cookie-choice-accept" onClick={() => choose(true)}>Accept</button>
        <button type="button" data-testid="cookie-reject" className="cookie-choice cookie-choice-reject" onClick={() => choose(false)}>Reject</button>
        <Link href="/cookie-settings/" data-testid="cookie-customize" className="cookie-settings-link inline-flex min-h-11 items-center font-display text-sm font-semibold text-purple underline" onClick={() => setOpen(false)}>
          Cookie settings
        </Link>
      </div>
    </div>
  );
}
