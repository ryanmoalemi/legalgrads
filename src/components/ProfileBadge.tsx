'use client';

import { useState } from 'react';

const BADGE_HTML = '<a href="https://legalgrads.com/attorneys/YOUR-STATE/YOUR-CITY/YOUR-PROFILE/" style="display:inline-block;padding:8px 14px;border-radius:999px;background:#0B0B3B;color:#ffffff;font-family:sans-serif;font-weight:700;text-decoration:none">LegalGrads profile</a>';

export function ProfileBadge() {
  const [note, setNote] = useState('');
  return (
    <section className="mt-10 rounded-3xl bg-white p-5" data-testid="profile-badge" aria-labelledby="badge-heading">
      <h2 id="badge-heading" className="font-display text-2xl font-extrabold">Profile badge</h2>
      <p className="mt-2 text-sm text-ink">Paste this HTML on your site. Replace the link with your own profile URL. The badge is a link, not a rating.</p>
      <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-2xl bg-cream p-4 text-xs text-navy" data-testid="badge-html">{BADGE_HTML}</pre>
      <button
        type="button"
        className="mt-4 min-h-11 rounded-full bg-navy px-5 font-display text-sm font-semibold text-white"
        onClick={() => void navigator.clipboard.writeText(BADGE_HTML).then(() => setNote('Copied the badge HTML.'), () => setNote('Copy is unavailable in this browser. Select the HTML above.'))}
      >
        Copy badge HTML
      </button>
      {note ? <p role="status" className="mt-2 text-sm">{note}</p> : null}
    </section>
  );
}
