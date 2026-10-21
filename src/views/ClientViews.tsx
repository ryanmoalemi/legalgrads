'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { actorFrom, useDemo } from '@/components/DemoProvider';
import { Empty, Skeleton, StatusPill } from '@/components/ui';
import { changePassword, dashboardCounts, exportData, getState, initDb, latestTerms, listConversations, listFavorites, listInquiries, listMatters, listNotifications, markAllRead, searchMessages, updateClient } from '@/lib/db';
import { stateName } from '@/lib/catalog';
import { AppointmentList, InquiryDetail, MatterDetail, Thread } from './shared';

function Gate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useDemo();
  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton /></div>;
  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10"><Empty title="Client sign-in needed" body="Use the Client button in the demo bar, or log in." href="/login/?next=/client/dashboard/" action="Log in" /></div>;
  if (user.role !== 'client') return <p className="mx-auto max-w-3xl px-4 py-10">This area is for clients. Choose Client in the demo bar.</p>;
  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}

export function ClientNav() {
  const links = [
    ['/client/dashboard/', 'Dashboard'],
    ['/client/saved/', 'Saved'],
    ['/client/requests/', 'Requests'],
    ['/client/messages/', 'Messages'],
    ['/client/appointments/', 'Appointments'],
    ['/client/matters/', 'Matters'],
    ['/client/settings/', 'Account'],
  ];
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto" aria-label="Client">
      {links.map(([href, label]) => <Link key={href} href={href} className="shrink-0 rounded-full bg-white px-3 py-2 font-display text-sm font-semibold">{label}</Link>)}
    </nav>
  );
}

export function ClientDashboard() {
  const { user } = useDemo();
  const counts = user ? dashboardCounts(actorFrom(user)) : null;
  const items = [
    ['Open inquiries', counts && 'inquiries' in counts ? counts.inquiries : 0, '/client/requests/'],
    ['Consults', counts && 'appointments' in counts ? counts.appointments : 0, '/client/appointments/'],
    ['Active matters', counts && 'matters' in counts ? counts.matters : 0, '/client/matters/'],
    ['Unread messages', counts && 'unread' in counts ? counts.unread : 0, '/client/messages/'],
    ['Saved attorneys', counts && 'saved' in counts ? counts.saved : 0, '/client/saved/'],
  ];
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Client dashboard</h1>
      <p className="mt-2 text-sm text-ink">Fictional matters stored in this browser.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([label, value, href]) => (
          <li key={String(label)}><Link href={String(href)} className="block rounded-3xl bg-white p-4"><span className="block font-display text-3xl font-extrabold">{value}</span><span className="text-sm">{label}</span></Link></li>
        ))}
      </ul>
    </Gate>
  );
}

export function ClientRequests() {
  const { user } = useDemo();
  const id = useSearchParams().get('id');
  const rows = user ? listInquiries(actorFrom(user)) : [];
  const db = user ? getState() : null;
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Requests</h1>
      {id ? <div className="mt-4"><InquiryDetail id={id} side="client" /></div> : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.id}><Link href={`/client/requests/?id=${row.id}`} className="block rounded-3xl bg-white p-4"><StatusPill status={row.status} /> <span className="font-semibold">{db?.users.find((u) => u.id === row.attorneyId)?.name}</span><p className="mt-1 text-sm">{row.description}</p></Link></li>
          ))}
          {rows.length === 0 ? <Empty title="No requests" body="Ask an attorney for a consultation from their profile." href="/find-lawyer/" action="Find a lawyer" /> : null}
        </ul>
      )}
    </Gate>
  );
}

export function ClientMessages() {
  const params = useSearchParams();
  const { user } = useDemo();
  const [q, setQ] = useState('');
  const id = params.get('id');
  const rows = user ? searchMessages(actorFrom(user), q) : [];
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Messages</h1>
      <label className="mt-4 block text-sm">Search conversations
        <input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full rounded-full border border-navy/10 px-4 py-3" />
      </label>
      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.convo.id}><Link href={`/client/messages/?id=${row.convo.id}`} className="block rounded-2xl bg-white p-3 text-sm">{row.inquiry?.description.slice(0, 80)} {row.unread ? <strong>({row.unread} unread)</strong> : null}</Link></li>
          ))}
        </ul>
        <div className="rounded-3xl bg-white p-4">{id ? <Thread conversationId={id} /> : <p>Select a conversation.</p>}</div>
      </div>
    </Gate>
  );
}

export function ClientAppointments() {
  return <Gate><ClientNav /><h1 className="font-display text-4xl font-extrabold">Appointments</h1><div className="mt-4"><AppointmentList side="client" /></div></Gate>;
}

export function ClientSaved() {
  const { user, rev } = useDemo();
  const [ready, setReady] = useState(false);
  useEffect(() => { void initDb().then(() => setReady(true)); }, [rev]);
  const cards = ready && user?.role === 'client' ? listFavorites(actorFrom(user)) : [];
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Saved attorneys</h1>
      <ul className="mt-4 space-y-3">
        {cards.map((card) => (
          <li key={card.userId} className="rounded-3xl bg-white p-4"><Link href={`/attorneys/${card.slug}/`} className="font-display text-xl font-extrabold">{card.displayName}</Link><p className="text-sm text-ink">{card.licenseJurisdictions.map(stateName).join(', ')} · fictional</p></li>
        ))}
      </ul>
      {cards.length === 0 ? <div className="mt-4"><Empty title="No saved attorneys" body="Save Maya from her profile and she will stay here after a reload." href="/attorneys/maya-r/" action="View Maya" /></div> : null}
    </Gate>
  );
}

export function ClientMatters() {
  const id = useSearchParams().get('id');
  const { user } = useDemo();
  const rows = user ? listMatters(actorFrom(user)) : [];
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Matters</h1>
      {id ? <div className="mt-4"><MatterDetail id={id} side="client" /></div> : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => <li key={row.id}><Link className="block rounded-3xl bg-white p-4" href={`/client/matters/?id=${row.id}`}><StatusPill status={row.status} /> <span data-testid="matter-status">{row.status}</span></Link></li>)}
        </ul>
      )}
    </Gate>
  );
}

export function ClientSettings() {
  const { user, switchUser } = useDemo();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const terms = user ? latestTerms(user.id) : null;
  const profile = user ? getState().clientProfiles.find((p) => p.userId === user.id) : null;
  return (
    <Gate>
      <ClientNav />
      <h1 className="font-display text-4xl font-extrabold">Account</h1>
      <p className="mt-2 text-sm">Signed in as {user?.email}. Email verified: {user?.emailVerified ? 'yes (demo)' : 'not yet'}.</p>
      <p className="mt-2 text-sm" data-testid="terms-version">Draft terms accepted: {terms ? `${terms.version} on ${terms.acceptedAt.slice(0, 10)}` : 'not recorded'}</p>
      <form className="mt-4 grid gap-3 rounded-3xl bg-white p-4" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          updateClient(actorFrom(user), { name: String(data.get('name') || ''), location: String(data.get('location') || ''), state: String(data.get('state') || ''), preferences: String(data.get('preferences') || '') });
          setMessage('Profile saved in this browser.');
          setError('');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Name<input name="name" defaultValue={user?.name} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">City<input name="location" defaultValue={profile?.location} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">State<input name="state" defaultValue={profile?.state} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">Preferences<textarea name="preferences" defaultValue={profile?.preferences} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink px-4 font-display font-semibold text-white">Save account</button>
      </form>
      <form className="mt-4 grid gap-3 rounded-3xl bg-white p-4" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          changePassword(actorFrom(user), String(data.get('current') || ''), String(data.get('next') || ''));
          setMessage('Demo password updated.');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <h2 className="font-display text-xl font-extrabold">Password</h2>
        <label className="text-sm">Current<input name="current" type="password" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <label className="text-sm">New<input name="next" type="password" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
        <button type="submit" className="min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white">Update password</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10" onClick={() => {
          const blob = new Blob([exportData(actorFrom(user))], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'legalgrads-demo-export.json';
          a.click();
          URL.revokeObjectURL(url);
          setMessage('Export downloaded. It contains only your demo records.');
        }}>Export my demo data</button>
        <Link href="/data-deletion/" className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10">Delete account</Link>
        <button type="button" className="min-h-11 rounded-full px-4 font-semibold" onClick={() => switchUser(null)}>Log out</button>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {message ? <p role="status" className="mt-3 text-sm">{message}</p> : null}
      <Notifications />
    </Gate>
  );
}

function Notifications() {
  const { user } = useDemo();
  const rows = user ? listNotifications(actorFrom(user)) : [];
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Notifications</h2>
        <button type="button" className="text-sm font-semibold text-purple" onClick={() => markAllRead(actorFrom(user))}>Mark read</button>
      </div>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => <li key={row.id} className="rounded-2xl bg-white p-3 text-sm"><Link href={row.href}>{row.body}</Link></li>)}
      </ul>
    </section>
  );
}

export function listClientConversationCount() {
  return listConversations;
}
