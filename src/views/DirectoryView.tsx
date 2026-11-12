'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SPECIALTIES, specialtyName } from '@/lib/catalog';
import { submitWaitlist } from '@/lib/applications';
import { publicContactHref } from '@/lib/applications';
import { MessageAttorneyForm } from '@/components/MessageAttorneyForm';
import { validEmail } from '@/lib/format';
import { getSupabase } from '@/lib/supabase';
import { joinedLabel } from '@/lib/joined';
import { PHASE2, supabaseConfigured } from '@/lib/site';
import { PillList } from '@/components/PillList';
import { Empty } from '@/components/ui';
import { knownCity } from '@/lib/places';
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
  office_region?: string | null; // office state when outside the licensing state, or INTL
}

type UnclaimedRow = { id: string; n: string; c: string; z: string; a: string; u: string; s?: string; r?: string };
async function loadUnclaimed(): Promise<PublicProfile[]> {
  try {
    const res = await fetch('/data/unclaimed-directory.json');
    if (!res.ok) return [];
    const data = (await res.json()) as UnclaimedRow[];
    return data.map((r) => ({
      id: `${r.s || 'CA'}-${r.id}`, full_name: r.n, practice_areas: [], cities_served: r.c, bio: '', languages: '', contact_link: '',
      admission_date: r.a || '', licensed_state: r.s || 'CA', office_zip: r.z || null, in_person: null, unclaimed_url: r.u, office_region: r.r || null,
    }));
  } catch { return []; }
}

export function DirectoryView() {
  const params = useSearchParams();
  const [specialty, setSpecialty] = useState(params.get('specialty') ?? '');
  const [city, setCity] = useState(params.get('city') ?? '');
  const [state, setState] = useState(params.get('state') ?? '');
  const [nameQ, setNameQ] = useState(params.get('q') ?? '');
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
  const [railOpen, setRailOpen] = useState(false);
  // Desktop shows the filter rail open; phones get a labeled disclosure above the results.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)');
    if (wide.matches) setRailOpen(true);
  }, []);

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
    if (nameQ.trim() && !row.full_name.toLowerCase().includes(nameQ.trim().toLowerCase())) return false;
    if (inPersonOnly && !row.in_person) return false;
    return true;
  });
  if (origin) {
    // Every matching attorney stays listed; only the order changes (unknown ZIPs go last).
    filtered.sort((a, b) => (dist(a) ?? Infinity) - (dist(b) ?? Infinity));
  }
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = [state ? stateLabel(state) : '', specialty ? specialtyName(specialty) : '', city.trim() ? `City: ${city.trim()}` : '', nameQ.trim() ? `Name: ${nameQ.trim()}` : '', inPersonOnly ? 'In-person' : ''].filter(Boolean);

  /** Filters and page live in the URL, so a bookmark or the Back button returns the same results. */
  function syncUrl(next: { state?: string; specialty?: string; city?: string; q?: string; page?: number }, push = false) {
    const q = new URLSearchParams();
    const values = { state, specialty, city, q: nameQ, ...next };
    if (values.state) q.set('state', values.state);
    if (values.specialty) q.set('specialty', values.specialty);
    if (values.city?.trim()) q.set('city', values.city.trim());
    if (values.q?.trim()) q.set('q', values.q.trim());
    if (next.page && next.page > 1) q.set('page', String(next.page));
    if (params.get('demo') === '1') q.set('demo', '1');
    const url = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
    if (push) window.history.pushState(null, '', url); else window.history.replaceState(null, '', url);
  }
  function changeState(value: string) { setState(value); syncUrl({ state: value }); }
  function changeSpecialty(value: string) { setSpecialty(value); syncUrl({ specialty: value }); }
  function changeCity(value: string) { setCity(value); syncUrl({ city: value }); }
  function changeName(value: string) { setNameQ(value); syncUrl({ q: value }); }
  function clearFilters() {
    setState(''); setSpecialty(''); setCity(''); setNameQ(''); setInPersonOnly(false); setOrigin(null); setGeoMsg('');
    syncUrl({ state: '', specialty: '', city: '', q: '' });
  }
  function goTo(next: number) {
    syncUrl({ page: next }, true);
    document.getElementById('results')?.scrollIntoView({ block: 'start' });
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
      ? 'You’re on the list. We’ll email you a directory note. You can browse public-record profiles without it.'
      : 'We did not store this on a server. Send the email so your address is not lost.');
  }

  const filters = (
    <form className="lg-dir__filters" aria-label="Filters" onSubmit={(event) => event.preventDefault()}>
      <label className="lg-field"><span>Licensing state</span>
        <select aria-label="State" data-testid="filter-state" className="lg-input" value={state} onChange={(event) => changeState(event.target.value)}>
          <option value="">Any state</option>
          {US_STATES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </label>
      <label className="lg-field"><span>Practice area</span>
        <select aria-label="Practice area" aria-describedby="practice-help" className="lg-input" value={specialty} onChange={(event) => changeSpecialty(event.target.value)}>
          <option value="">Any</option>
          {SPECIALTIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <small id="practice-help">Only claimed profiles list practice areas.</small>
      </label>
      <label className="lg-field"><span>Office city</span>
        <input aria-label="City" className="lg-input" value={city} onChange={(event) => changeCity(event.target.value)} placeholder="Los Angeles" />
      </label>
      <label className="lg-field"><span>Attorney name</span>
        <input aria-label="Attorney name" data-testid="filter-name" className="lg-input" type="search" value={nameQ} onChange={(event) => changeName(event.target.value)} placeholder="First or last name" autoComplete="off" />
      </label>
      <button type="button" data-testid="chip-in-person" aria-pressed={inPersonOnly} onClick={() => setInPersonOnly((v) => !v)} className={`lg-dir__chip${inPersonOnly ? ' is-on' : ''}`}>In-person or visits your business</button>
      <div className="lg-dir__near" data-testid="near-me">
        <span className="lg-label">Sort by distance</span>
        <button type="button" data-testid="near-me-button" onClick={() => void nearMe()} className="lg-btn lg-btn--secondary lg-btn--full">Near me</button>
        <div className="lg-dir__where">
          <input aria-label="ZIP or city" data-testid="near-where" className="lg-input" value={where} onChange={(e) => setWhere(e.target.value)} placeholder="ZIP or city" autoComplete="off" inputMode="text" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void nearWhere(e as unknown as FormEvent<HTMLFormElement>); } }} />
          <button type="button" className="lg-btn lg-btn--secondary" onClick={(e) => void nearWhere(e as unknown as FormEvent<HTMLFormElement>)}>Sort</button>
        </div>
        {origin ? <button type="button" className="lg-dir__link" onClick={() => { setOrigin(null); setGeoMsg(''); }}>Clear distance sort</button> : null}
        {geoMsg ? <p role="status" className="lg-dir__fine">{geoMsg}</p> : null}
        <p className="lg-dir__fine">Distances are approximate (office ZIP). You choose who to contact; we don&apos;t assign, forward or rank by payment.</p>
      </div>
      {active.length ? <button type="button" data-testid="clear-filters" className="lg-dir__link" onClick={clearFilters}>Clear filters</button> : null}
    </form>
  );

  return (
    <div className="lg-dir">
      <section className="lg-band">
        <div className="lg-container">
          <h1 className="lg-dir__title">Find an attorney</h1>
          <p className="lg-sub lg-dir__lead">Search every listed attorney. Claimed profiles, where the attorney confirmed their details with an email code and a bar record check, come first. Unclaimed profiles come from official licensing records and do not list practice areas yet.</p>
          <span className="lg-accent" aria-hidden="true" />
        </div>
      </section>
      <div className="lg-container lg-dir__grid">
        <aside className="lg-dir__rail" aria-label="Search filters">
          <details className="lg-dir__disclosure" open={railOpen} onToggle={(e) => setRailOpen((e.currentTarget as HTMLDetailsElement).open)}>
            <summary>Filters{active.length ? `: ${active.join(', ')}` : ''}</summary>
            {filters}
          </details>
        </aside>
        <section id="results" className="lg-dir__results" aria-labelledby="results-h">
          <div className="lg-dir__head">
            <h2 id="results-h">Attorney profiles</h2>
            {rows ? <p role="status" data-testid="result-count">{filtered.length === 0 ? 'No profiles match' : `${filtered.length.toLocaleString('en-US')} ${filtered.length === 1 ? 'profile matches' : 'profiles match'}`}{active.length ? ` ${active.join(', ')}` : ''}{pages > 1 ? `. Page ${page} of ${pages.toLocaleString('en-US')}` : ''}</p> : <p role="status">Loading profiles…</p>}
          </div>
          {rows && rows.length === 0 ? (
            <div data-testid="directory-empty">
              <Empty title="The search did not load" body="Browse public-record profiles by state below, or try again in a minute." />
            </div>
          ) : null}
          {rows && rows.length > 0 && filtered.length === 0 ? (
            <div className="lg-dir__empty">
              <p className="lg-dir__empty-title">No profiles match those filters.</p>
              <p>{specialty ? `No claimed profile lists ${specialtyName(specialty)} yet, and unclaimed profiles do not list practice areas. ` : ''}Try a broader location or remove a filter.</p>
              <button type="button" className="lg-btn lg-btn--secondary" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : null}
          {shown.length > 0 ? (
            <ul className="lg-dir__list">
              {shown.map((row) => (
                <li key={row.id} data-testid="attorney-card" className="lg-dir__row">
                  <span className="lg-avatar lg-dir__avatar" aria-hidden="true">{initialsOf(row.full_name)}</span>
                  <div className="lg-dir__body">
                    <h3>{row.full_name}</h3>
                    <p>{row.licensed_state ? `Licensed in ${stateLabel(row.licensed_state)}` : ''}{officeLine(row)}{admittedLabel(row.admission_date)}{dist(row) !== null ? <span data-testid="distance"> · ~{Math.round(dist(row) as number)} mi</span> : null}</p>
                    {row.unclaimed_url ? (
                      <p className="lg-dir__badge">Profile not yet claimed</p>
                    ) : (<>
                      <div className="lg-dir__tags">
                        <span className="lg-dir__badge is-claimed">Profile claimed · {joinedLabel(row.published_at || row.created_at)}</span>
                        {row.in_person ? <span className="lg-dir__badge">In-person</span> : null}
                        {row.insured ? <span className="lg-dir__badge">Insured</span> : null}
                      </div>
                      {row.bio ? <p className="lg-dir__bio">{row.bio}</p> : null}
                      <PillList items={row.practice_areas.map((slug) => specialtyName(slug))} className="mt-2" />
                      {row.languages ? <p>Languages: {row.languages}</p> : null}
                      {publicContactHref(row.contact_link) ? <p><a href={publicContactHref(row.contact_link) ?? undefined}>Website</a></p> : null}
                      <MessageAttorneyForm profileId={row.id} />
                    </>)}
                  </div>
                  {row.unclaimed_url ? <a className="lg-btn lg-btn--secondary lg-dir__view" href={row.unclaimed_url} aria-label={`View ${row.full_name}'s profile`}>View profile</a> : PHASE2 ? <Link className="lg-btn lg-btn--secondary lg-dir__view" href={`/attorneys/profile/?id=${row.id}`}>View profile</Link> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {pages > 1 ? (
            <nav className="lg-dir__pager" aria-label="Result pages">
              <button type="button" className="lg-btn lg-btn--secondary" disabled={page <= 1} onClick={() => goTo(page - 1)}>Previous</button>
              <span>Page {page} of {pages.toLocaleString('en-US')}</span>
              <button type="button" data-testid="next-page" className="lg-btn lg-btn--secondary" disabled={page >= pages} onClick={() => goTo(page + 1)}>Next</button>
            </nav>
          ) : null}

          <form onSubmit={onWaitlist} className="lg-dir__note">
            <h2>Optional directory note</h2>
            <p>Get an occasional email when new attorneys or features are added. You do not need it to browse.</p>
            <label className="lg-field" htmlFor="directory-email"><span>Email</span></label>
            <input id="directory-email" name="email" type="email" required data-testid="directory-email" className="lg-input" placeholder="you@example.com" />
            <button type="submit" data-testid="directory-waitlist" className="lg-btn lg-btn--secondary">Join the list</button>
            {error ? <p role="alert" className="lg-notice lg-notice--error">{error}</p> : null}
            {notice ? <p role="status" data-testid="directory-status">{notice}</p> : null}
            {mailto ? <p><a data-testid="directory-mailto" href={mailto}>Email this signup to ryan@legalgrads.com</a></p> : null}
          </form>
        </section>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function stateLabel(code: string): string {
  return US_STATES.find((item) => item.code === code)?.name || code;
}

function initialsOf(name: string): string {
  return name.replace(/\(demo\)/, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

/** Office line. A missing or state-named city never prints as a place ("California, CA"). */
function officeLine(row: PublicProfile): string {
  const value = row.cities_served || '';
  if (!knownCity(value, row.licensed_state || '')) return ' · Office location not listed';
  if (row.office_region === 'INTL') return ` · Office: ${value} (outside the U.S.)`;
  return row.office_region ? ` · Office: ${value}, ${row.office_region}` : ` · Office: ${value}`;
}

/** Keeps the record's precision: a year stays a year, a date shows month and year. */
function admittedLabel(value: string): string {
  if (!value) return '';
  const m = value.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!m) return '';
  return m[2] ? ` · Admitted ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ` · Admitted ${m[1]}`;
}
