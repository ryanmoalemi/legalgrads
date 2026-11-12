'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { claimHref, normalizeProfilePath } from '@/lib/claim';

const PROFILE_KEY = 'legalgrads-claim-profile';

/** Keeps the attorney's own claim when they read the promise from their profile (?profile=, or this tab's last profile). */
function useClaimTarget(): { href: string; profile: string | null } {
  const [target, setTarget] = useState<{ href: string; profile: string | null }>({ href: '/claim/', profile: null });
  useEffect(() => {
    let path = normalizeProfilePath(new URLSearchParams(window.location.search).get('profile'));
    try {
      if (path) sessionStorage.setItem(PROFILE_KEY, path);
      else path = normalizeProfilePath(sessionStorage.getItem(PROFILE_KEY));
    } catch { /* storage off: fall back to the query only */ }
    if (path) setTarget({ href: claimHref(path), profile: path });
  }, []);
  return target;
}

const button = 'lg-btn lg-btn--primary';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-[20px] border border-line bg-white p-5 shadow-[0_4px_18px_rgb(16_19_63/7%)] sm:p-7">
      <h2 className="font-display text-2xl font-bold text-navy sm:text-[28px]">{title}</h2>
      <div className="mt-3 grid gap-3 leading-7 text-copy">{children}</div>
    </section>
  );
}

export function FreeListingPromiseView() {
  const { href: claim, profile } = useClaimTarget();
  return (
    <>
      <section className="lg-band">
        <div className="lg-container max-w-3xl">
          <p className="font-display text-sm font-bold uppercase tracking-[.08em] text-[#E4D4FF]">Our free listing promise</p>
          <h1 className="mt-2 font-display text-[32px] font-extrabold leading-[1.12] tracking-tight sm:text-5xl">Your listing is free. Always.</h1>
          <p className="lg-sub mt-3 text-lg">You will never have to pay to claim, publish, or maintain your standard LegalGrads profile.</p>
          <span className="lg-accent" aria-hidden="true" />
        </div>
      </section>
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href={claim} data-testid="promise-claim" className={button}>Claim my free profile</Link>
        {profile ? <Link href={profile} data-testid="promise-back" className="font-semibold text-purple underline">Back to the profile</Link> : <Link href="/join/" data-testid="promise-join" className="font-semibold text-purple underline">Not listed yet? Apply for a free listing</Link>}
      </div>
      <Section title="What your free listing includes">
        <p>Your free listing includes your photo, biography, services, fee and consultation information, and contact options. You can update that information and receive and respond to inquiries through the standard contact features without a listing subscription or per-inquiry fee.</p>
        <p>There is no trial to expire and no renewal fee. Your listing does not become a paid product as your practice grows.</p>
        <p>You also get private stats for your profile: recorded profile views, website clicks, contact clicks, and delivered inquiries. Only you can see them.</p>
      </Section>
      <Section title="Optional: sponsored upgrade for more visibility">
        <p>We plan to offer an optional sponsored upgrade for attorneys who want extra visibility. Your free listing, along with its contact features, stays free forever. Choosing the upgrade is entirely up to you.</p>
        <p>Sponsored placements will be clearly labeled as sponsored advertisements. Paying for an upgrade will not mean that LegalGrads recommends a lawyer or ranks that lawyer higher in merit.</p>
      </Section>
      <Section title="What does “always free” cover?">
        <p>This promise applies to the standard listing and features described above for as long as LegalGrads operates its directory. Profiles must meet our licensing, eligibility, and content requirements.</p>
        <p>The free listing promise concerns LegalGrads’ charges to attorneys. Attorneys set their own legal fees and consultation terms.</p>
      </Section>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href={claim} data-testid="promise-claim-bottom" className={button}>Claim my free profile</Link>
        <Link className="font-semibold text-purple underline" href="/attorney-terms/">Attorney Terms</Link>
        <a className="font-semibold text-purple underline" href="mailto:ryan@legalgrads.com">ryan@legalgrads.com</a>
      </div>
    </div>
    </>
  );
}
