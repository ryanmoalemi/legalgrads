'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SPECIALTIES, STATES } from '@/lib/catalog';
import { actorFrom, useDemo } from '@/components/DemoProvider';
import { DemoMark, Empty, Skeleton, StatusPill } from '@/components/ui';
import {
  addService,
  addSlot,
  allServicesFor,
  attorneyBySlug,
  blockSlot,
  dashboardCounts,
  getState,
  initDb,
  listAppointments,
  listInquiries,
  listMatters,
  publishProfile,
  register,
  saveOnboarding,
  searchMessages,
  updateHourlyRate,
  updateProfile,
} from '@/lib/db';
import { formatWhen, money } from '@/lib/format';
import { AppointmentList, InquiryDetail, MatterDetail, Thread } from './shared';

function Gate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useDemo();
  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton /></div>;
  if (!user || user.role !== 'attorney') {
    return <div className="mx-auto max-w-3xl px-4 py-10"><Empty title="Attorney sign-in needed" body="Use the Attorney button in the demo bar or create a profile." href="/attorney/onboarding/" action="Create your profile" /></div>;
  }
  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}

export function AttorneyNav() {
  const links = [
    ['/attorney/dashboard/', 'Dashboard'],
    ['/attorney/leads/', 'Leads'],
    ['/attorney/messages/', 'Messages'],
    ['/attorney/calendar/', 'Calendar'],
    ['/attorney/matters/', 'Matters'],
    ['/attorney/services/', 'Services & Pricing'],
    ['/attorney/profile/edit/', 'Public profile'],
    ['/attorney/verification/', 'Verification'],
    ['/attorney/settings/', 'Settings'],
  ];
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto" aria-label="Attorney">
      {links.map(([href, label]) => <Link key={href} href={href} className="shrink-0 rounded-full bg-white px-3 py-2 font-display text-sm font-semibold">{label}</Link>)}
    </nav>
  );
}

function useProfile() {
  const { user, rev } = useDemo();
  const [ready, setReady] = useState(false);
  useEffect(() => { void initDb().then(() => setReady(true)); }, [rev]);
  if (!ready || !user) return null;
  return getState().attorneyProfiles.find((p) => p.userId === user.id) ?? null;
}

export function AttorneyDashboard() {
  const { user } = useDemo();
  const counts = user?.role === 'attorney' ? dashboardCounts(actorFrom(user)) : null;
  const leads = user?.role === 'attorney' ? listInquiries(actorFrom(user)).slice(0, 5) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Attorney dashboard</h1>
      <p className="mt-2 text-sm text-ink">Earnings below are simulated. No money is collected.</p>
      {counts && 'earnings' in counts ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ['New leads', counts.leads],
            ['Conflict review', counts.conflicts],
            ['Consults', counts.appointments],
            ['Active matters', counts.matters],
            ['Unread', counts.unread],
            [`Demo earnings $${counts.earnings}`, counts.earnings],
          ].map(([label, value]) => (
            <li key={String(label)} className="rounded-3xl bg-white p-4"><span className="font-display text-3xl font-extrabold">{value}</span><span className="mt-1 block text-sm">{label}</span><DemoMark /></li>
          ))}
        </ul>
      ) : null}
      <h2 className="mt-8 font-display text-2xl font-extrabold">Latest leads</h2>
      <ul className="mt-3 space-y-2">
        {leads.map((lead) => <li key={lead.id}><Link className="block rounded-2xl bg-white p-3" href={`/attorney/leads/?id=${lead.id}`}><StatusPill status={lead.status} /> {lead.description}</Link></li>)}
      </ul>
    </Gate>
  );
}

export function AttorneyLeads() {
  const id = useSearchParams().get('id');
  const { user } = useDemo();
  const rows = user?.role === 'attorney' ? listInquiries(actorFrom(user)) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Leads</h1>
      <p className="mt-2 text-sm text-ink">Accepting a lead does not create representation. Clear a simulated conflict, then send terms.</p>
      {id ? <div className="mt-4"><InquiryDetail id={id} side="attorney" /></div> : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => <li key={row.id}><Link href={`/attorney/leads/?id=${row.id}`} className="block rounded-3xl bg-white p-4"><StatusPill status={row.status} /><p className="mt-1">{row.description}</p><p className="text-sm text-ink">{row.jurisdiction} · {row.budget} · {row.urgency}</p></Link></li>)}
        </ul>
      )}
    </Gate>
  );
}

export function AttorneyMessages() {
  const id = useSearchParams().get('id');
  const { user } = useDemo();
  const [q, setQ] = useState('');
  const rows = user?.role === 'attorney' ? searchMessages(actorFrom(user), q) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Messages</h1>
      <label className="mt-3 block text-sm">Search<input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full rounded-full border border-navy/10 px-4 py-3" /></label>
      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ul>{rows.map((row) => <li key={row.convo.id}><Link className="block rounded-2xl bg-white p-3 text-sm" href={`/attorney/messages/?id=${row.convo.id}`}>{row.inquiry?.description.slice(0, 70)} {row.unread ? `(${row.unread})` : ''}</Link></li>)}</ul>
        <div className="rounded-3xl bg-white p-4">{id ? <Thread conversationId={id} /> : <p>Select a conversation.</p>}</div>
      </div>
    </Gate>
  );
}

export function AttorneyCalendar() {
  const { user } = useDemo();
  const [error, setError] = useState('');
  const profile = useProfile();
  const slots = profile ? getState().availabilitySlots.filter((s) => s.attorneyId === profile.userId) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Calendar</h1>
      <p className="mt-2 text-sm text-ink">Demo clock is October 21, 2026. Video links are simulated.</p>
      <div className="mt-4"><AppointmentList side="attorney" /></div>
      <h2 className="mt-6 font-display text-xl font-extrabold">Slots</h2>
      <ul className="mt-2 space-y-2">
        {slots.map((slot) => (
          <li key={slot.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm">
            {formatWhen(slot.startAtUtc, profile?.timezone)} · {slot.status}
            {slot.status === 'open' ? <button type="button" className="min-h-11 text-purple" onClick={() => { try { blockSlot(actorFrom(user), slot.id); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); } }}>Block</button> : null}
          </li>
        ))}
      </ul>
      <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => {
        event.preventDefault();
        const start = String(new FormData(event.currentTarget).get('start') || '');
        try { addSlot(actorFrom(user), new Date(start).toISOString()); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Add slot<input name="start" type="datetime-local" required className="mt-1 rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <button type="submit" className="mt-6 min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white">Publish slot</button>
      </form>
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
      <p className="mt-4 text-xs text-ink">Confirmed count: {user?.role === 'attorney' ? listAppointments(actorFrom(user)).filter((a) => a.status === 'confirmed').length : 0}</p>
    </Gate>
  );
}

export function AttorneyMatters() {
  const id = useSearchParams().get('id');
  const { user } = useDemo();
  const rows = user?.role === 'attorney' ? listMatters(actorFrom(user)) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Matters</h1>
      {id ? <div className="mt-4"><MatterDetail id={id} side="attorney" /></div> : (
        <ul className="mt-4 space-y-3">{rows.map((row) => <li key={row.id}><Link className="block rounded-3xl bg-white p-4" href={`/attorney/matters/?id=${row.id}`}><span data-testid="matter-status">{row.status}</span></Link></li>)}</ul>
      )}
    </Gate>
  );
}

export function AttorneyServices() {
  const { user } = useDemo();
  const profile = useProfile();
  const [rate, setRate] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => { if (profile) setRate(String(profile.hourlyRate)); }, [profile?.hourlyRate]);
  const services = user?.role === 'attorney' ? allServicesFor(actorFrom(user), user.id) : [];
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Services and pricing</h1>
      <p className="mt-2 text-sm">Rates are fictional demo numbers. <DemoMark /></p>
      <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={(event) => {
        event.preventDefault();
        try { updateHourlyRate(actorFrom(user), Number(rate)); setNote('Hourly rate saved. Profile and search use the new number.'); setError(''); }
        catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Hourly rate
          <input data-testid="hourly-rate" value={rate} onChange={(e) => setRate(e.target.value)} type="number" min={0} className="mt-1 block rounded-2xl border border-navy/10 px-3 py-2" />
        </label>
        <button type="submit" data-testid="save-rate" className="min-h-11 rounded-full bg-pink px-4 font-display font-semibold text-white">Save rate</button>
      </form>
      <ul className="mt-4 space-y-2">
        {services.map((service) => <li key={service.id} className="rounded-2xl bg-white p-3 text-sm">{service.title} · {money(service.fixedPrice)} <DemoMark /> · {service.active ? 'active' : 'hidden'}</li>)}
      </ul>
      <form className="mt-4 grid gap-2 rounded-3xl bg-white p-4" onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          addService(actorFrom(user), {
            title: String(data.get('title') || ''),
            fixedPrice: Number(data.get('price') || 0),
            scope: String(data.get('scope') || ''),
            turnaroundDays: Number(data.get('days') || 5),
          });
          setNote('Service added. It shows on your public profile.');
          event.currentTarget.reset();
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <h2 className="font-display text-xl font-extrabold">Add a fixed-price service</h2>
        <label className="text-sm">Title<input data-testid="service-title" name="title" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Price<input data-testid="service-price" name="price" type="number" min={0} required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Scope<textarea name="scope" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Turnaround days<input name="days" type="number" defaultValue={5} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <button type="submit" data-testid="add-service" className="min-h-11 rounded-full bg-navy px-4 font-semibold text-white">Add service</button>
      </form>
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
      {note ? <p role="status" className="mt-2 text-sm">{note}</p> : null}
    </Gate>
  );
}

export function AttorneyProfileEdit() {
  const { user } = useDemo();
  const profile = useProfile();
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  if (!profile || !user) return <Gate><AttorneyNav /><Skeleton /></Gate>;
  const selected = new Set(getState().attorneySpecialties.filter((r) => r.attorneyId === user.id).map((r) => r.specialtyId));
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Edit public profile</h1>
      <form className="mt-4 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const specialtyIds = SPECIALTIES.filter((s) => data.get(`spec-${s.id}`)).map((s) => s.id);
        try {
          updateProfile(actorFrom(user), {
            displayName: String(data.get('displayName') || ''),
            bio: String(data.get('bio') || ''),
            city: String(data.get('city') || ''),
            lawSchool: String(data.get('lawSchool') || ''),
            specialtyIds,
          });
          setNote('Saved. Search and the public profile use these fields.');
          setError('');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Display name<input name="displayName" defaultValue={profile.displayName} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">City<input name="city" defaultValue={profile.city} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Law school<input name="lawSchool" defaultValue={profile.lawSchool} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Bio<textarea name="bio" defaultValue={profile.bio} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" rows={4} /></label>
        <fieldset>
          <legend className="text-sm font-medium">Practice areas</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SPECIALTIES.map((s) => <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name={`spec-${s.id}`} defaultChecked={selected.has(s.id)} /> {s.name}</label>)}
          </div>
        </fieldset>
        <button type="submit" className="min-h-11 rounded-full bg-pink px-4 font-display font-semibold text-white">Save profile</button>
      </form>
      {profile.slug ? <p className="mt-3 text-sm"><Link className="text-purple" href={`/attorneys/${profile.slug}/`}>View public profile</Link></p> : null}
      {error ? <p role="alert" className="text-sm text-pink">{error}</p> : null}
      {note ? <p role="status" className="text-sm">{note}</p> : null}
    </Gate>
  );
}

export function AttorneyVerification() {
  const profile = useProfile();
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Verification</h1>
      <p className="mt-2 text-sm">This badge is simulated. Production needs a primary-source bar check. <DemoMark /></p>
      {profile ? (
        <ul className="mt-4 space-y-1 rounded-3xl bg-white p-4 text-sm">
          <li>License status: {profile.licenseStatus}</li>
          <li>Simulated verification: {profile.verificationStatus}</li>
          <li>Date: {profile.verificationDate ?? 'n/a'}</li>
          <li>Published: {profile.isPublished ? 'yes' : 'no'}</li>
          <li>Bar number: none stored</li>
        </ul>
      ) : null}
      <p className="mt-3 text-sm">A demo admin approves or rejects pending profiles from the admin log.</p>
    </Gate>
  );
}

export function AttorneySettings() {
  const { user, switchUser } = useDemo();
  const profile = useProfile();
  return (
    <Gate>
      <AttorneyNav />
      <h1 className="font-display text-4xl font-extrabold">Settings</h1>
      <p className="mt-2 text-sm">{user?.email}</p>
      <p className="mt-2 text-sm">Newly licensed window is set by the demo admin. Your admission date: {profile?.admissionDate ?? 'not admitted'}.</p>
      <button type="button" className="mt-4 min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10" onClick={() => switchUser(null)}>Log out</button>
      <p className="mt-4 text-sm"><Link className="text-purple" href="/data-deletion/">Export or delete this demo account</Link></p>
    </Gate>
  );
}

export function OnboardingView() {
  const { ready, user, switchUser } = useDemo();
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const profile = user?.role === 'attorney' ? getState().attorneyProfiles.find((p) => p.userId === user.id) : null;

  function save(form: HTMLFormElement, publish: boolean) {
    const data = new FormData(form);
    try {
      let actor = actorFrom(user);
      if (!user) {
        const created = register({
          name: String(data.get('name') || ''),
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
          role: 'attorney',
          acceptTerms: data.get('terms') === 'on',
          adult: data.get('adult') === 'on',
          state: String(data.get('jurisdiction') || ''),
        });
        switchUser(created.id);
        actor = { id: created.id, role: 'attorney' };
      }
      const specialtyIds = SPECIALTIES.filter((s) => data.get(`spec-${s.id}`)).map((s) => s.id);
      saveOnboarding(actor, {
        displayName: String(data.get('name') || user?.name || ''),
        licenseStatus: String(data.get('licenseStatus') || 'not_admitted') as 'active' | 'pending' | 'not_admitted',
        admissionDate: String(data.get('admissionDate') || '') || null,
        jurisdiction: String(data.get('jurisdiction') || ''),
        lawSchool: String(data.get('lawSchool') || ''),
        graduationYear: Number(data.get('graduationYear') || 2026),
        specialtyIds,
        bio: String(data.get('bio') || ''),
        hourlyRate: Number(data.get('hourlyRate') || 0),
        city: String(data.get('city') || ''),
      });
      if (publish) publishProfile(actor);
      setNote(publish ? 'Profile published into demo search.' : 'Draft saved. It is not in public search.');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    }
  }

  if (!ready) return <Skeleton className="m-8 h-40" />;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-display text-sm font-bold text-purple">For newly licensed attorneys</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Create your profile</h1>
      <p className="mt-2 text-ink">The demo window defaults to three years after admission. Graduates who are not admitted can keep a draft. They cannot publish or accept legal matters.</p>
      <form className="mt-6 grid gap-3" onSubmit={(event) => { event.preventDefault(); save(event.currentTarget, false); }}>
        {!user ? (
          <>
            <label className="text-sm">Full name<input name="name" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
            <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
            <label className="text-sm">Password<input name="password" type="password" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm"><input name="adult" type="checkbox" /> I am 18 or older</label>
            <label className="flex items-center gap-2 text-sm"><input name="terms" type="checkbox" /> I accept the draft terms</label>
          </>
        ) : <input type="hidden" name="name" value={profile?.displayName || user.name} />}
        <label className="text-sm">License status
          <select name="licenseStatus" defaultValue={profile?.licenseStatus ?? 'not_admitted'} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">
            <option value="active">Admitted — active</option>
            <option value="pending">Admission pending</option>
            <option value="not_admitted">Not yet admitted</option>
          </select>
        </label>
        <label className="text-sm">Admission date<input name="admissionDate" type="date" defaultValue={profile?.admissionDate ?? ''} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Jurisdiction
          <select name="jurisdiction" defaultValue={profile?.licenseJurisdictions[0] ?? 'CA'} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">
            {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Law school<input name="lawSchool" defaultValue={profile?.lawSchool} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Graduation year<input name="graduationYear" type="number" defaultValue={profile?.graduationYear ?? 2026} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">City<input name="city" defaultValue={profile?.city} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Hourly rate (demo)<input name="hourlyRate" type="number" min={0} defaultValue={profile?.hourlyRate ?? 150} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Bio<textarea name="bio" defaultValue={profile?.bio} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" rows={4} /></label>
        <fieldset>
          <legend className="text-sm font-medium">Specialties</legend>
          {SPECIALTIES.map((s) => <label key={s.id} className="mt-1 flex items-center gap-2 text-sm"><input type="checkbox" name={`spec-${s.id}`} /> {s.name}</label>)}
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="min-h-11 rounded-full bg-white px-4 font-display font-semibold ring-1 ring-navy/10">Save draft</button>
          <button type="button" data-testid="publish-profile" className="min-h-11 rounded-full bg-pink px-4 font-display font-semibold text-white" onClick={(event) => { const form = event.currentTarget.closest('form'); if (form) save(form, true); }}>Publish profile</button>
        </div>
      </form>
      {error ? <p role="alert" data-testid="publish-error" className="mt-3 text-sm text-pink">{error}</p> : null}
      {note ? <p role="status" className="mt-3 text-sm">{note}</p> : null}
      <p className="mt-4 text-xs text-ink">Publish checks admission, the simulated verification state, and the eligibility window inside the data layer.</p>
    </div>
  );
}

export function previewAttorney(slug: string) {
  return attorneyBySlug(slug);
}
