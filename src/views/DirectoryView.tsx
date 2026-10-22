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

  useEffect(() => {
    setSpecialty(params.get('specialty') ?? '');
  }, [params]);

  useEffect(() => {
    if (!supabaseConfigured()) {
      setRows([]);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setRows([]);
      return;
    }
    const base = 'id, full_name, practice_areas, cities_served, bio, languages, contact_link, admission_date, insured, published_at, created_at';
    const load = (columns: string) => supabase.from('attorney_profiles').select(columns).eq('published', true);
    void (async () => {
      let result = await load(`${base}, licensed_state`);
      if (result.error) result = await load(base);
      if (result.error || !result.data) setRows([]);
      else setRows(result.data as unknown as PublicProfile[]);
    })();
  }, []);

  const filtered = (rows ?? []).filter((row) => {
    if (state && row.licensed_state !== state) return false;
    if (specialty && !row.practice_areas.includes(specialty)) return false;
    if (city && !row.cities_served.toLowerCase().includes(city.trim().toLowerCase())) return false;
    return true;
  });

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
                  <p className="text-sm text-ink">{row.cities_served}{row.licensed_state ? `, ${row.licensed_state}` : ''} · Admitted {row.admission_date}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <p className="inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{joinedLabel(row.published_at || row.created_at)}</p>
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
