'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { specialtyName } from '@/lib/catalog';
import { money } from '@/lib/format';
import { downloadShareCard } from '@/lib/share';
import { getSupabase } from '@/lib/supabase';
import { PHASE2, supabaseConfigured } from '@/lib/site';
import { PageIntro } from '@/components/ui';

function Closed() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro kicker="Not linked" title="Not public yet" body="Attorney login, profile editing, review, and the public profile page are built and stay off the site navigation until the next phase." />
    </div>
  );
}

export function AttorneyLoginView() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  if (!PHASE2) return <Closed />;

  async function send(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError('Sign-in needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Email ryan@legalgrads.com meanwhile.');
      return;
    }
    setError('');
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/attorney/profile/` },
    });
    if (authError) setError(authError.message);
    else setStatus('Check your email for the sign-in link. It only works if this site URL is allowed in the Supabase auth settings.');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro kicker="Attorneys" title="Email a sign-in link" body="No password. The link signs you into the profile editor." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => void send(event)}>
        <label className="text-sm font-medium">Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
        </label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Send magic link</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {status ? <p role="status" className="mt-3 text-sm">{status}</p> : null}
    </div>
  );
}

interface ProfileRow {
  id: string;
  full_name: string;
  bio: string;
  cities_served: string;
  languages: string;
  rate_type: 'flat' | 'hourly';
  rate_amount: number;
  contact_link: string;
  practice_areas: string[];
  founding_member: boolean;
  bar_number: string;
  admission_date: string;
  published: boolean;
}

export function PublicProfileView() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!PHASE2) return;
    const supabase = getSupabase();
    if (!supabase || !id) {
      setMissing(true);
      return;
    }
    void supabase.from('attorney_profiles').select('*').eq('id', id).eq('published', true).maybeSingle().then(({ data }) => {
      setProfile((data as ProfileRow | null) ?? null);
      setMissing(!data);
    });
  }, [id]);

  if (!PHASE2) return <Closed />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageIntro title={missing ? 'Profile not published' : 'Loading profile'} body="Only published attorneys can be viewed." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">{profile.full_name}</h1>
      <p className="mt-2 text-ink">{profile.cities_served} · California State Bar {profile.bar_number} · admitted {profile.admission_date}</p>
      <p className="mt-4 font-display text-2xl font-extrabold">{money(Number(profile.rate_amount))}{profile.rate_type === 'hourly' ? '/hr' : ' flat'}</p>
      <p className="mt-4 leading-7 text-ink">{profile.bio}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {profile.practice_areas.map((slug) => <span key={slug} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{specialtyName(slug)}</span>)}
      </div>
      <p className="mt-3 text-sm">Languages: {profile.languages}</p>
      <p className="mt-3"><a className="font-semibold text-purple" href={profile.contact_link}>Contact or book</a></p>
      <button type="button" className="mt-6 min-h-11 rounded-full bg-navy px-5 font-display text-sm font-semibold text-white" onClick={() => downloadShareCard(profile.full_name)}>Download “I’m on Legalgrads”</button>
    </div>
  );
}

export function ProfileEditorView() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [bio, setBio] = useState('');
  const [cities, setCities] = useState('');
  const [languages, setLanguages] = useState('');
  const [rate, setRate] = useState('');
  const [link, setLink] = useState('');
  const [applicationId, setApplicationId] = useState('');

  useEffect(() => {
    if (!PHASE2) return;
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      const email = data.user?.email;
      if (!email) {
        setStatus('Sign in with the email link first.');
        return;
      }
      const { data: apps } = await supabase.from('attorney_applications').select('id, bio, cities_served, languages, rate_amount, contact_link').ilike('email', email).limit(1);
      const app = apps?.[0] as { id: string; bio: string; cities_served: string; languages: string; rate_amount: number; contact_link: string } | undefined;
      if (!app) {
        setStatus('No application is tied to this email yet.');
        return;
      }
      setApplicationId(app.id);
      setBio(app.bio);
      setCities(app.cities_served);
      setLanguages(app.languages);
      setRate(String(app.rate_amount));
      setLink(app.contact_link);
    });
  }, []);

  if (!PHASE2) return <Closed />;

  async function save(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !applicationId) return;
    const { error: updateError } = await supabase.from('attorney_applications').update({
      bio,
      cities_served: cities,
      languages,
      rate_amount: Number(rate),
      contact_link: link,
    }).eq('id', applicationId);
    if (updateError) setError(updateError.message);
    else {
      await supabase.from('attorney_profiles').update({
        bio,
        cities_served: cities,
        languages,
        rate_amount: Number(rate),
        contact_link: link,
      }).eq('application_id', applicationId);
      setStatus('Saved. Publishing still requires an admin State Bar review.');
      setError('');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title="Edit your listing" body="You can update the public text. You cannot publish yourself." />
      {!supabaseConfigured() ? <p className="mt-4 text-sm">This editor needs Supabase before it can load a profile.</p> : null}
      <form className="mt-6 grid gap-3" onSubmit={(event) => void save(event)}>
        <label className="text-sm font-medium">Cities<input className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={cities} onChange={(event) => setCities(event.target.value)} /></label>
        <label className="text-sm font-medium">Languages<input className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={languages} onChange={(event) => setLanguages(event.target.value)} /></label>
        <label className="text-sm font-medium">Rate amount<input type="number" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
        <label className="text-sm font-medium">Contact link<input className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={link} onChange={(event) => setLink(event.target.value)} /></label>
        <label className="text-sm font-medium">Bio<textarea className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" rows={5} value={bio} onChange={(event) => setBio(event.target.value)} /></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Save</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {status ? <p role="status" className="mt-3 text-sm">{status}</p> : null}
    </div>
  );
}

interface ApplicationRow {
  id: string;
  full_name: string;
  email: string;
  bar_number: string;
  admission_date: string;
  status: string;
  cities_served: string;
  photo_path: string | null;
}

export function AdminReviewView() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!PHASE2) return;
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.from('attorney_applications').select('id, full_name, email, bar_number, admission_date, status, cities_served, photo_path').order('created_at', { ascending: false }).then(({ data, error: readError }) => {
      if (readError) setError(readError.message);
      setRows((data as ApplicationRow[] | null) ?? []);
    });
  }, []);

  if (!PHASE2) return <Closed />;

  async function decide(id: string, decision: 'verified' | 'rejected') {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error: rpcError } = await supabase.rpc('review_application', { app_id: id, decision });
    if (rpcError) setError(rpcError.message);
    else {
      setStatus(decision === 'verified' ? 'Marked verified and published.' : 'Marked rejected. The listing is not public.');
      setRows((current) => current.map((row) => row.id === id ? { ...row, status: decision } : row));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro title="Review applications" body="Approve only after you have checked the California State Bar record yourself. This page is not linked from the public site." />
      {error ? <p role="alert" className="mt-4 text-sm text-pink">{error}</p> : null}
      {status ? <p role="status" className="mt-4 text-sm">{status}</p> : null}
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-3xl bg-white p-4 text-sm">
            <p className="font-display text-lg font-extrabold">{row.full_name}</p>
            <p>{row.email} · Bar {row.bar_number} · admitted {row.admission_date} · {row.status}</p>
            <p>{row.cities_served}</p>
            {row.photo_path ? <p>Private photo path: {row.photo_path}</p> : null}
            <div className="mt-3 flex gap-2">
              <button type="button" className="min-h-11 rounded-full bg-navy px-4 font-semibold text-white" onClick={() => void decide(row.id, 'verified')}>Approve after bar check</button>
              <button type="button" className="min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10" onClick={() => void decide(row.id, 'rejected')}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
