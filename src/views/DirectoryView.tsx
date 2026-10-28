'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SPECIALTIES, specialtyName } from '@/lib/catalog';
import { submitWaitlist } from '@/lib/applications';
import { publicContactHref } from '@/lib/applications';
import { MessageAttorneyForm } from '@/components/MessageAttorneyForm';
import { money, validEmail } from '@/lib/format';
import { getSupabase } from '@/lib/supabase';
import { joinedLabel } from '@/lib/joined';
import { PHASE2, supabaseConfigured } from '@/lib/site';
import { Empty, PageIntro } from '@/components/ui';
import Link from 'next/link';
import { US_STATES } from '@/lib/states';
import { type LatLng, browserLocation, loadZips, miles, resolveQuery, stateFor } from '@/lib/geo';

// Fictional rows for ?demo=1 only (never real attorneys).
const DEMO_ROWS: PublicProfile[] = [
  ['demo-1', 'Jordan Example', 'San Diego', '92101', true],
  ['demo-2', 'Riley Sample', 'Los Angeles', '90012', false],
  ['demo-3', 'Casey Placeholder', 'San Francisco', '94103', true],
  ['demo-4', 'Morgan Fictional', 'Sacramento', '95814', false],
  ['demo-5', 'Taylor Demo', 'Irvine', '92618', true],
].map(([id, full_name, city, office_zip, in_person]) => ({
  id: id as string, full_name: `${full_name} (demo)`, practice_areas: [], cities_served: city as string,
  bio: 'Fictional demo listing for testing the directory.', languages: 'English', contact_link: '',
  admission_date: '2025-12-01', licensed_state: 'CA', office_zip: office_zip as string, in_person: in_person as boolean,
}));

interface PublicProfile {
  id: string;
  full_name: string;
  practice_areas: string[];
  cities_served: string;
  bio: string;
  languages: string;
  contact_link: string;
  admission_date: string;
  published_at?: string | null;
  created_at?: string | null;
  insured?: boolean;
  licensed_state?: string | null;
  office_zip?: string | null;
  in_person?: boolean | null;
  unclaimed_url?: string; // static unclaimed profile (public State Bar record)
}

type UnclaimedRow = { id: string; n: string; c: string; z: string; a: string; u: string };
async function loadUnclaimed(): Promise<PublicProfile[]> {
  try {
    const res = await fetch('/data/unclaimed-directory.json');
    if (!res.ok) return [];
    const data = (await res.json()) as UnclaimedRow[];
    return data.map((r) => ({
      id: `ca-${r.id}`, full_name: r.n, practice_areas: [], cities_served: r.c, bio: '', languages: '', contact_link: '',
      admission_date: r.a, licensed_state: 'CA', office_zip: r.z || null, in_person: null, unclaimed_url: r.u,
    }));
  } catch { return []; }
}

export function DirectoryView() {
  const params = useSearchParams();
  const [specialty, setSpecialty] = useState(params.get('specialty') ?? '');
  const [city, setCity] = useState('');
  const [state, setState] = useState(params.get('state') ?? '');
  const [rows, setRows] = useState<PublicProfile[] | null>(null);
  const [notice, setNotice] = useState('');
  const [mailto, setMailto] = useState('');
  const [error, setError] = useState('');
  // Location stays in memory only: never stored or sent to the DB/analytics.
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [where, setWhere] = useState('');
  const [geoMsg, setGeoMsg] = useState('');
  const [inPersonOnly, setInPersonOnly] = useState(false);
  const [zipTable, setZipTable] = useState<Record<string, LatLng> | null>(null);
  const demo = params.get('demo') === '1';

  useEffect(() => {
    setSpecialty(params.get('specialty') ?? '');
  }, [params]);

  useEffect(() => {
    if (demo) { setRows(DEMO_ROWS); return; }
    void (async () => {
      const unclaimed = loadUnclaimed();
      const supabase = supabaseConfigured() ? getSupabase() : null;
      let claimed: PublicProfile[] = [];
      if (supabase) {
        const base = 'id, full_name, practice_areas, cities_served, bio, languages, contact_link, admission_date, insured, published_at, created_at';
        const load = (columns: string) => supabase.from('attorney_profiles').select(columns).eq('published', true);
        let result = await load(`${base}, licensed_state, office_zip, in_person`);
        if (result.error) result = await load(`${base}, licensed_state`);
        if (result.error) result = await load(base);
        if (!result.error && result.data) claimed = result.data as unknown as PublicProfile[];
      }
      // Claimed (verified) listings first, then unclaimed State Bar records.
      setRows([...claimed, ...(await unclaimed)]);
    })();
  }, [demo]);

  async function useOrigin(point: LatLng) {
    setZipTable(await loadZips());
    if (!state) setState(await stateFor(point));
    setOrigin(point);
    setGeoMsg('Sorted by distance, nearest first. Your location stays on this device.');
  }
  async function nearMe() {
    setGeoMsg('Asking your browser for your location…');
    try { await useOrigin(await browserLocation()); } catch { setGeoMsg('Location is off. Enter a ZIP or city instead.'); }
  }
  async function nearWhere(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const point = await resolveQuery(where, state);
    if (point) await useOrigin(point); else setGeoMsg('We could not find that ZIP or city. Try a 5-digit ZIP or "City, ST".');
  }
  const dist = (row: PublicProfile) => {
    const c = origin && zipTable && row.office_zip ? zipTable[row.office_zip] : undefined;
    return c && origin ? miles(origin, c) : null;
  };

  const filtered = (rows ?? []).filter((row) => {
    if (state && row.licensed_state !== state) return false;
    if (specialty && !row.practice_areas.includes(specialty)) return false;
    if (city && !row.cities_served.toLowerCase().includes(city.trim().toLowerCase())) return false;
    if (inPersonOnly && !row.in_person) return false;
    return true;
  });
  if (origin) {
    // Every matching attorney stays listed; only the order changes (unknown ZIPs go last).
    filtered.sort((a, b) => (dist(a) ?? Infinity) - (dist(b) ?? Infinity));
  }

  async function onWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    const result = await submitWaitlist(email, `directory:${specialty || 'any'}`);
    setMailto(result.channel === 'mailto' ? result.mailto : '');
    setNotice(result.channel === 'supabase'
      ? 'You’re on the list. We’ll email you when attorneys are published.'
      : 'We did not store this on a server. Send the email so your address is not lost.');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageIntro
        kicker="Find an attorney"
        title="U.S. attorneys, after a state bar check"
        body="Browse published listings, or leave your email and we’ll tell you when the first attorneys are live."
      />
      <form className="mt-6 grid gap-3 rounded-3xl bg-white p-4 sm:grid-cols-3" aria-label="Filters" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm font-medium">State
          <select aria-label="State" data-testid="filter-state" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">Any state</option>
            {US_STATES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Practice area
          <select aria-label="Practice area" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
            <option value="">Any</option>
            {SPECIALTIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">City
          <input aria-label="City" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Los Angeles" />
        </label>
      </form>

      <section className="mt-3 rounded-3xl bg-white p-4" aria-label="Sort by distance" data-testid="near-me">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" data-testid="near-me-button" onClick={() => void nearMe()} className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white">📍 Near me</button>
          <form className="flex min-w-0 flex-1 gap-2" onSubmit={(e) => void nearWhere(e)}>
            <input aria-label="ZIP or city" data-testid="near-where" className="min-w-0 flex-1 rounded-2xl border border-navy/10 px-3 py-2" value={where} onChange={(e) => setWhere(e.target.value)} placeholder="ZIP or city" autoComplete="off" inputMode="text" />
            <button type="submit" className="min-h-11 rounded-full border-2 border-purple px-4 font-semibold text-purple">Sort</button>
          </form>
          {origin ? <button type="button" className="text-sm font-semibold text-purple underline" onClick={() => { setOrigin(null); setGeoMsg(''); }}>Clear</button> : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" data-testid="chip-in-person" aria-pressed={inPersonOnly} onClick={() => setInPersonOnly((v) => !v)} className={`rounded-full px-3 py-2 text-sm font-bold ${inPersonOnly ? 'bg-purple text-white' : 'bg-[#F3E9FF] text-purple'}`}>🤝 In-person / visits your business</button>
        </div>
        {geoMsg ? <p role="status" className="mt-2 text-sm text-ink">{geoMsg}</p> : null}
        <p className="mt-2 text-xs text-ink">Distances are approximate (office ZIP). You choose who to contact; we don&apos;t assign, forward or rank by payment.</p>
      </section>

      {rows === null ? <p className="mt-6 text-sm text-ink">Loading published listings…</p> : null}
      {rows && rows.length === 0 ? (
        <div className="mt-6" data-testid="directory-empty">
          <Empty
            title="Attorneys joining now — launching soon"
            body="No listing is public until Legalgrads manually verifies the attorney’s state bar record. Leave your email and we’ll write when the directory opens."
          />
        </div>
      ) : null}
      {rows && rows.length > 0 && filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink">No published attorneys match those filters yet.</p>
      ) : null}
      {filtered.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {filtered.map((row) => (
            <li key={row.id} data-testid="attorney-card" className="rounded-3xl bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-extrabold">{row.full_name}</h2>
                  <p className="text-sm text-ink">{row.cities_served}{row.licensed_state ? `, ${row.licensed_state}` : ''} · Admitted {row.admission_date.slice(0, 7)}{dist(row) !== null ? <span data-testid="distance"> · ~{Math.round(dist(row) as number)} mi</span> : null}</p>
                </div>
              </div>
              {row.unclaimed_url ? (<>
                <p className="mt-2 inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">Unclaimed profile · from State Bar records</p>
                <p className="mt-3"><Link className="font-semibold text-purple" href={row.unclaimed_url}>View {row.full_name}&apos;s profile</Link></p>
              </>) : (<>
              <div className="mt-2 flex flex-wrap gap-2">
                <p className="inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{joinedLabel(row.published_at || row.created_at)}</p>
                {row.in_person ? <p className="inline-flex rounded-full bg-[#FFF1F8] px-3 py-1 text-xs font-bold text-[#C2006A]">🤝 In-person</p> : null}
                {row.insured ? <p className="inline-flex rounded-full bg-mint/20 px-3 py-1 text-xs font-bold text-navy">Insured</p> : null}
              </div>
              <p className="mt-3 text-sm text-ink">{row.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {row.practice_areas.map((slug) => <span key={slug} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{specialtyName(slug)}</span>)}
              </div>
              <p className="mt-2 text-sm">Languages: {row.languages}</p>
              {PHASE2 ? <Link className="mt-3 inline-flex font-semibold text-purple" href={`/attorneys/profile/?id=${row.id}`}>View profile</Link> : null}
              {publicContactHref(row.contact_link) ? <p className="mt-2 text-sm"><a className="font-semibold text-purple" href={publicContactHref(row.contact_link) ?? undefined}>Website</a></p> : null}
              <MessageAttorneyForm profileId={row.id} />
              </>)}
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={onWaitlist} className="mt-8 max-w-xl rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl font-extrabold">Get a note when listings are live</h2>
        <label className="mt-3 block text-sm font-medium" htmlFor="directory-email">Email</label>
        <input id="directory-email" name="email" type="email" required data-testid="directory-email" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" placeholder="you@example.com" />
        <button type="submit" data-testid="directory-waitlist" className="mt-3 min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white">Join the waitlist</button>
        {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
        {notice ? <p role="status" data-testid="directory-status" className="mt-2 text-sm">{notice}</p> : null}
        {mailto ? <p className="mt-2 text-sm"><a data-testid="directory-mailto" className="font-semibold text-purple" href={mailto}>Email this signup to ryan@legalgrads.com</a></p> : null}
      </form>
    </div>
  );
}
