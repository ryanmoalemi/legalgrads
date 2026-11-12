'use client';

import { useState } from 'react';

/** Filters the server-rendered city tiles on a state hub in place. Holds no data, so the
 * page HTML is not duplicated into the client payload. */
export function CityFilter({ target }: { target: string }) {
  const [q, setQ] = useState('');
  const [shown, setShown] = useState<number | null>(null);
  function apply(value: string) {
    setQ(value);
    const needle = value.trim().toLowerCase();
    const root = document.getElementById(target);
    if (!root) return;
    let count = 0;
    root.querySelectorAll<HTMLElement>('[data-city]').forEach((li) => {
      const hit = !needle || (li.dataset.city || '').includes(needle);
      li.hidden = !hit;
      if (hit) count += 1;
    });
    root.querySelectorAll<HTMLElement>('[data-letter]').forEach((group) => {
      group.hidden = !group.querySelector('[data-city]:not([hidden])');
    });
    setShown(needle ? count : null);
  }
  return (
    <div className="lg-hub__search">
      <label className="lg-label" htmlFor="city-filter">Find a city</label>
      <input id="city-filter" className="lg-input" type="search" value={q} onChange={(e) => apply(e.target.value)} placeholder="Start typing a city name" autoComplete="off" data-testid="city-filter" />
      <p className="lg-dir__fine" role="status" aria-live="polite">{shown === null ? '' : shown === 1 ? '1 city matches.' : `${shown} cities match.`}</p>
    </div>
  );
}
