'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SPECIALTIES, STATES, stateName } from '@/lib/catalog';
import { initDb, joinWaitlist, publicAttorneys, toggleFavorite, isFavorite } from '@/lib/db';
import { money } from '@/lib/format';
import { searchAttorneys } from '@/lib/search';
import { previewState } from '@/lib/seed';
import type { AttorneyCard, SearchFilters } from '@/lib/types';
import { useDemo, actorFrom } from '@/components/DemoProvider';
import { DemoMark, Empty, Skeleton } from '@/components/ui';

const PAGE_SIZE = 6;

export function ResultsView() {
  const params = useSearchParams();
  const router = useRouter();
  const { ready, user, rev } = useDemo();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttorneyCard[]>([]);
  const [note, setNote] = useState('');

  const formatParam = params.get('format');
  const sortParam = params.get('sort');
  const filters: SearchFilters = {
    q: params.get('q') ?? '',
    specialties: (params.get('specialty') ?? '').split(',').filter(Boolean),
    jurisdiction: params.get('jurisdiction') ?? '',
    rateMin: params.get('rateMin') ? Number(params.get('rateMin')) : undefined,
    rateMax: params.get('rateMax') ? Number(params.get('rateMax')) : undefined,
    recentYears: params.get('recentYears') ? Number(params.get('recentYears')) : undefined,
    fixedPrice: params.get('fixedPrice') === '1',
    consultation: params.get('consultation') === '1',
    format: formatParam === 'remote' || formatParam === 'in_person' ? formatParam : '',
    sort: sortParam === 'price' || sortParam === 'newest' || sortParam === 'response' ? sortParam : 'relevance',
  };
  const page = Math.max(1, Number(params.get('page') || 1));

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      void initDb().then(() => {
        if (!alive) return;
        setRows(publicAttorneys(filters));
        setLoading(false);
      });
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString(), rev]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    router.push(`/find-lawyer/results/?${next.toString()}`);
  }

  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <form className="h-max rounded-3xl bg-white p-4" aria-label="Filters" onSubmit={(e) => e.preventDefault()}>
        <h1 className="font-display text-2xl font-extrabold">Search</h1>
        <label className="mt-3 block text-sm font-medium">Keywords
          <input className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" defaultValue={filters.q} key={filters.q} onBlur={(e) => setParam('q', e.target.value)} />
        </label>
        <label className="mt-3 block text-sm font-medium">Specialty
          <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" value={filters.specialties?.[0] ?? ''} onChange={(e) => setParam('specialty', e.target.value)}>
            <option value="">Any</option>
            {SPECIALTIES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </label>
        <label className="mt-3 block text-sm font-medium">Licensed jurisdiction
          <select aria-label="Licensed jurisdiction" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" value={filters.jurisdiction} onChange={(e) => setParam('jurisdiction', e.target.value)}>
            <option value="">Any</option>
            {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-sm font-medium">Min rate
            <input type="number" min={0} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" defaultValue={filters.rateMin ?? ''} onBlur={(e) => setParam('rateMin', e.target.value)} />
          </label>
          <label className="text-sm font-medium">Max rate
            <input type="number" min={0} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" defaultValue={filters.rateMax ?? ''} onBlur={(e) => setParam('rateMax', e.target.value)} />
          </label>
        </div>
        <label className="mt-3 block text-sm font-medium">Admission recency
          <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" value={filters.recentYears ?? ''} onChange={(e) => setParam('recentYears', e.target.value)}>
            <option value="">Within demo window</option>
            <option value="1">Within 1 year</option>
            <option value="2">Within 2 years</option>
            <option value="3">Within 3 years</option>
          </select>
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.fixedPrice} onChange={(e) => setParam('fixedPrice', e.target.checked ? '1' : '')} /> Fixed-price services</label>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.consultation} onChange={(e) => setParam('consultation', e.target.checked ? '1' : '')} /> Consultation availability</label>
        <label className="mt-3 block text-sm font-medium">Format
          <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" value={filters.format} onChange={(e) => setParam('format', e.target.value)}>
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="in_person">In person</option>
          </select>
        </label>
        <label className="mt-3 block text-sm font-medium">Sort
          <select aria-label="Sort" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" value={filters.sort} onChange={(e) => setParam('sort', e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="price">Lowest price</option>
            <option value="newest">Newest admission</option>
            <option value="response">Demo response time</option>
          </select>
        </label>
        <button type="button" className="mt-4 min-h-11 text-sm font-semibold text-purple" onClick={() => router.push('/find-lawyer/results/')}>Clear filters</button>
        <p className="mt-2 text-xs text-ink">Response time is seeded demo data, not a measured promise.</p>
      </form>
      <div>
        <p data-testid="result-count" className="text-sm text-ink">{rows.length} matching attorneys · fictional demo</p>
        <Link href="/find-lawyer/" className="text-sm font-semibold text-purple">Edit intake</Link>
        {note ? <p role="status" className="mt-2 text-sm">{note}</p> : null}
        {loading ? (
          <div className="mt-4 grid gap-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-4">
            <Empty title="No eligible attorneys" body="Nobody bookable matches these filters. Change them, or leave your email for a fictional notification list. We will not invent a match." />
            <NotifyForm onDone={(email) => { joinWaitlist(email, 'notify', params.toString()); setNote('Saved in this browser. No email was sent.'); }} />
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {slice.map((card) => (
              <li key={card.userId} data-testid="result-card" className="grid gap-4 rounded-3xl bg-white p-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                <img src={card.photoUrl} alt={`Fictional demo portrait of ${card.displayName}`} className="h-40 w-full rounded-2xl object-cover object-top" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 data-testid="result-name" className="font-display text-xl font-extrabold">{card.displayName}</h2>
                      <p className="text-sm text-ink">{card.licenseJurisdictions.map(stateName).join(', ')} · DEMO verified · simulated</p>
                      <p className="text-sm text-ink">Class of {card.graduationYear} · {card.lawSchool} · fictional education</p>
                    </div>
                    <p className="font-display font-extrabold">{money(card.hourlyRate)}/hr <DemoMark /></p>
                  </div>
                  <p className="mt-2 text-sm text-ink">{card.bio}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {card.cardTags.map((tag) => <span key={tag} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{tag}</span>)}
                  </div>
                  {card.minFixedPrice !== null ? <p className="mt-2 text-sm">Fixed-price from {money(card.minFixedPrice)} <DemoMark /></p> : null}
                  <p className="mt-1 text-xs text-ink">Demo response time about {card.responseTimeHours} hours · fictional</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/attorneys/${card.slug}/`} className="inline-flex min-h-11 items-center rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">View Profile</Link>
                    <button
                      type="button"
                      className="min-h-11 rounded-full bg-cream px-4 font-display text-sm font-semibold"
                      onClick={() => {
                        if (!user || user.role !== 'client') {
                          router.push(`/login/?next=${encodeURIComponent(`/attorneys/${card.slug}/?resume=save`)}`);
                          return;
                        }
                        const saved = toggleFavorite(actorFrom(user), card.userId);
                        setNote(saved ? `${card.displayName} saved.` : `${card.displayName} removed.`);
                      }}
                    >
                      {ready && user && isFavorite(user.id, card.userId) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 ? (
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10 disabled:opacity-40" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>Previous page</button>
            <span className="text-sm">Page {page} of {pages}</span>
            <button type="button" className="min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10 disabled:opacity-40" disabled={page >= pages} onClick={() => setParam('page', String(page + 1))}>Next page</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NotifyForm({ onDone }: { onDone: (email: string) => void }) {
  return (
    <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => {
      event.preventDefault();
      const email = String(new FormData(event.currentTarget).get('email') || '');
      if (email.includes('@')) onDone(email);
    }}>
      <label className="sr-only" htmlFor="notify-email">Email for notifications</label>
      <input id="notify-email" name="email" type="email" required placeholder="Email for a demo notification" className="min-h-11 flex-1 rounded-full border border-navy/10 px-4" />
      <button type="submit" className="min-h-11 rounded-full bg-navy px-4 font-display text-sm font-semibold text-white">Notify me</button>
    </form>
  );
}

export function previewCount() {
  return searchAttorneys(previewState(), {}).length;
}
