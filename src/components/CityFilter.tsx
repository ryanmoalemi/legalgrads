'use client';

import { useRef, useState } from 'react';

/** Filters the server-rendered city tiles on a state hub in place. Holds no data, so the
 * page HTML is not duplicated into the client payload. Sections, letter groups and alphabet
 * links with no visible match are hidden while a search is active. */
export function CityFilter({ target }: { target: string }) {
  const [q, setQ] = useState('');
  const [shown, setShown] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function apply(value: string) {
    setQ(value);
    const needle = value.trim().toLowerCase();
    const root = document.getElementById(target);
    if (!root) return;
    let count = 0;
    root.querySelectorAll<HTMLElement>('[data-city]').forEach((li) => {
      const hit = !needle || (li.dataset.city || '').split('|').some((name) => name.includes(needle));
      li.hidden = !hit;
      if (hit) count += 1;
    });
    const visible = (el: Element) => Boolean(el.querySelector('[data-city]:not([hidden])'));
    root.querySelectorAll<HTMLElement>('[data-letter]').forEach((group) => { group.hidden = Boolean(needle) && !visible(group); });
    root.querySelectorAll<HTMLElement>('[data-filter-section]').forEach((section) => { section.hidden = Boolean(needle) && !visible(section); });
    // The alphabet only helps when browsing the full index.
    root.querySelectorAll<HTMLElement>('[data-letter-nav]').forEach((nav) => { nav.hidden = Boolean(needle); });
    setShown(needle ? count : null);
  }

  function clear() {
    apply('');
    input.current?.focus();
  }

  const message = shown === null ? '' : shown === 0 ? `No cities match "${q.trim()}". Check the spelling or try fewer letters.` : shown === 1 ? '1 city matches.' : `${shown} cities match.`;
  return (
    <div className="lg-hub__search">
      <label className="lg-label" htmlFor="city-filter">Find a city</label>
      <div className="lg-hub__namerow">
        <input ref={input} id="city-filter" className="lg-input" type="search" value={q} onChange={(e) => apply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') clear(); }} placeholder="Start typing a city name" autoComplete="off" data-testid="city-filter" aria-describedby="city-filter-status" />
        {q ? <button type="button" className="lg-btn lg-btn--secondary" onClick={clear} data-testid="city-filter-clear">Clear search</button> : null}
      </div>
      <p id="city-filter-status" className="lg-dir__fine" role="status" aria-live="polite" data-testid="city-filter-status">{message}</p>
    </div>
  );
}
