'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { CONTACT_EMAIL, DEMO_PASSWORD, STATES } from '@/lib/catalog';
import { actorFrom, useDemo } from '@/components/DemoProvider';
import { PageIntro } from '@/components/ui';
import {
  bumpTerms,
  createPrivacyRequest,
  createReport,
  deleteAccount,
  exportData,
  getState,
  listActivity,
  listPrivacyRequests,
  listReports,
  login,
  lookupPrivacyRequest,
  register,
  requestPasswordReset,
  resetPassword,
  resolvePrivacyRequest,
  setEligibilityWindow,
  setReportStatus,
  setVerification,
  verifyEmailDemo,
} from '@/lib/db';
import { safeNext, validEmail } from '@/lib/format';
import { analyticsLog, readConsent, track, writeConsent } from '@/lib/consent';

export function LoginView() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const { switchUser } = useDemo();
  const [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <PageIntro title="Log in" body="Demo passwords are not production credentials. Every seeded account uses the same demo password." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const user = login(String(data.get('email') || ''), String(data.get('password') || ''));
          switchUser(user.id);
          setError('');
          router.push(next);
        } catch (err) { setError(err instanceof Error ? err.message : 'Could not log in.'); }
      }}>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" defaultValue="casey@demo.legalgrads.test" /></label>
        <label className="text-sm">Password<input name="password" type="password" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" defaultValue={DEMO_PASSWORD} /></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Log in</button>
        {error ? <p role="alert" className="text-sm text-pink">{error}</p> : null}
      </form>
      <p className="mt-4 text-sm">Client casey@demo.legalgrads.test · Attorney maya@demo.legalgrads.test · Admin admin@demo.legalgrads.test · password {DEMO_PASSWORD}</p>
      <p className="mt-2 text-sm"><Link className="text-purple" href="/register/">Create an account</Link> · <Link className="text-purple" href="/forgot-password/">Forgot password</Link></p>
    </div>
  );
}

export function RegisterView() {
  const router = useRouter();
  const { switchUser } = useDemo();
  const [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <PageIntro title="Create a demo account" body="Adults only. You must accept the draft terms. No real email is sent." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const user = register({
            name: String(data.get('name') || ''),
            email: String(data.get('email') || ''),
            password: String(data.get('password') || ''),
            role: data.get('role') === 'attorney' ? 'attorney' : 'client',
            acceptTerms: data.get('terms') === 'on',
            adult: data.get('adult') === 'on',
            state: String(data.get('state') || ''),
          });
          switchUser(user.id);
          router.push('/verify-email/');
        } catch (err) { setError(err instanceof Error ? err.message : 'Could not register.'); }
      }}>
        <label className="text-sm">Full name<input name="name" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Password<input name="password" type="password" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">State
          <select name="state" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3">{STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
        </label>
        <label className="text-sm">I am joining as
          <select name="role" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3"><option value="client">Client</option><option value="attorney">Attorney</option></select>
        </label>
        <label className="flex items-center gap-2 text-sm"><input name="adult" type="checkbox" data-testid="register-age" /> I am 18 or older</label>
        <label className="flex items-center gap-2 text-sm"><input name="terms" type="checkbox" data-testid="register-terms" /> I accept the <Link href="/terms/" className="text-purple">draft terms</Link></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Create account</button>
        {error ? <p role="alert" className="text-sm text-pink">{error}</p> : null}
      </form>
    </div>
  );
}

export function VerifyEmailView() {
  const { user } = useDemo();
  const [note, setNote] = useState('');
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title="Verify email" body="No email is sent in this demo. Use the button to mark the current demo account verified." />
      <button type="button" className="mt-6 min-h-11 rounded-full bg-navy px-4 font-semibold text-white" onClick={() => {
        if (!user) { setNote('Log in first. Nothing was emailed.'); return; }
        verifyEmailDemo(actorFrom(user));
        setNote('Marked verified inside this browser.');
      }}>Mark email verified (demo)</button>
      {note ? <p role="status" className="mt-3 text-sm">{note}</p> : null}
    </div>
  );
}

export function ForgotPasswordView() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title="Forgot password" body="The reset token is shown on this page. No email is sent." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get('email') || '');
        const result = requestPasswordReset(email);
        setToken(result.token);
        setNote('Simulated reset created. Use the token below. No email was sent.');
      }}>
        <label className="text-sm">Email<input name="email" type="email" required defaultValue={params.get('email') ?? ''} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <button type="submit" className="min-h-11 rounded-full bg-navy font-semibold text-white">Create demo reset</button>
      </form>
      {token ? <p className="mt-3 text-sm">Demo token: {token}</p> : null}
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          resetPassword(String(data.get('email') || ''), String(data.get('token') || token), String(data.get('password') || ''));
          setNote('Password updated for this browser’s demo account.');
          setError('');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Token<input name="token" value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">New password<input name="password" type="password" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-semibold text-white">Set new password</button>
      </form>
      {note ? <p role="status" className="mt-3 text-sm">{note}</p> : null}
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
    </div>
  );
}

export function AdminView() {
  const { ready, user } = useDemo();
  const [reason, setReason] = useState('Demo rejection: sample reason');
  const [error, setError] = useState('');
  if (!ready) return null;
  if (!user || user.role !== 'admin') return <div className="mx-auto max-w-3xl px-4 py-10"><p>Switch to Admin in the demo bar to open the log.</p></div>;
  const actor = actorFrom(user);
  const db = getState();
  const tickets = listPrivacyRequests(actor);
  const reports = listReports(actor);
  const activity = listActivity(actor).slice(0, 20);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-4xl font-extrabold">Demo admin</h1>
      <p className="mt-2 text-sm text-ink">Simulated verification, privacy tickets, and the audit log. Not a production console.</p>
      <section className="mt-6">
        <h2 className="font-display text-2xl font-extrabold">Verification queue</h2>
        <ul className="mt-3 space-y-2">
          {db.attorneyProfiles.map((profile) => (
            <li key={profile.userId} className="rounded-2xl bg-white p-3 text-sm">
              {profile.displayName} · license {profile.licenseStatus} · verification {profile.verificationStatus} · published {profile.isPublished ? 'yes' : 'no'}
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="min-h-11 rounded-full bg-navy px-3 text-white" onClick={() => setVerification(actor, profile.userId, 'approved')}>Approve simulated check</button>
                <button type="button" className="min-h-11 rounded-full bg-white px-3 ring-1 ring-navy/10" onClick={() => setVerification(actor, profile.userId, 'rejected')}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8" data-testid="admin-privacy">
        <h2 className="font-display text-2xl font-extrabold">Privacy requests</h2>
        <label className="mt-2 block text-sm">Resolution note
          <input aria-label="Resolution" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
        </label>
        <ul className="mt-3 space-y-2">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-2xl bg-white p-3 text-sm">
              <span className="font-semibold">{ticket.id}</span> · {ticket.type} · {ticket.status} · {ticket.email}
              <p>{ticket.details}</p>
              {ticket.resolution ? <p>Resolution: {ticket.resolution}</p> : null}
              <div className="mt-2 flex gap-2">
                <button type="button" className="min-h-11 rounded-full bg-navy px-3 text-white" onClick={() => resolvePrivacyRequest(actor, ticket.id, 'completed', reason)}>Complete</button>
                <button type="button" className="min-h-11 rounded-full bg-pink px-3 text-white" onClick={() => { try { resolvePrivacyRequest(actor, ticket.id, 'rejected', reason); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); } }}>Reject</button>
              </div>
            </li>
          ))}
          {tickets.length === 0 ? <li>No privacy tickets yet.</li> : null}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Reports</h2>
        <ul className="mt-3 space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl bg-white p-3 text-sm">{report.targetType} · {report.status} · {report.details}
              <button type="button" className="ml-2 min-h-11 text-purple" onClick={() => setReportStatus(actor, report.id, 'acknowledged')}>Acknowledge</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Settings</h2>
        <form className="mt-2 flex flex-wrap gap-2" onSubmit={(event) => {
          event.preventDefault();
          setEligibilityWindow(actor, Number(new FormData(event.currentTarget).get('years')));
        }}>
          <label className="text-sm">Newly licensed window (years)<input name="years" type="number" min={1} max={10} defaultValue={db.settings.eligibilityWindowYears} className="ml-2 rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <button type="submit" className="min-h-11 rounded-full bg-navy px-4 text-white">Save window</button>
        </form>
        <button type="button" className="mt-3 min-h-11 rounded-full bg-white px-4 font-semibold ring-1 ring-navy/10" onClick={() => bumpTerms(actor)}>Publish a new draft terms version</button>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Audit log</h2>
        <ul className="mt-3 space-y-1 text-sm">{activity.map((event) => <li key={event.id}>{event.createdAt.slice(0, 16)} · {event.summary}</li>)}</ul>
      </section>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
    </div>
  );
}

export function CookieSettingsView() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState('');
  const [log, setLog] = useState<{ channel: string; name: string; at: string }[]>([]);
  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    setLog(analyticsLog());
  }, []);
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro kicker="DRAFT" title="Cookie settings" body="Necessary storage stays on. Optional categories start off. Nothing here loads a third-party tracker." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        writeConsent({ analytics, marketing });
        setStatus('Preferences saved on this device.');
        setLog(analyticsLog());
      }}>
        <label className="flex items-center gap-2"><input type="checkbox" checked disabled /> Strictly necessary (always on)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing</label>
        <button type="submit" className="min-h-11 rounded-full bg-navy px-4 font-semibold text-white">Save preferences</button>
      </form>
      <button type="button" data-testid="analytics-event" className="mt-4 min-h-11 rounded-full bg-pink px-4 font-semibold text-white" onClick={() => {
        const result = track('analytics', 'demo_page_view');
        setStatus(result.reason);
        setLog(analyticsLog());
      }}>Send demo analytics event</button>
      <p data-testid="analytics-status" role="status" className="mt-3 text-sm">{status}</p>
      <ul className="mt-3 text-xs text-ink">{log.map((row, index) => <li key={index}>{row.channel}: {row.name}</li>)}</ul>
    </div>
  );
}

export function PrivacyRequestView() {
  const params = useSearchParams();
  const { ready } = useDemo();
  const [ticket, setTicket] = useState(params.get('ticket') ?? '');
  const [error, setError] = useState('');
  const found = ready && ticket ? lookupPrivacyRequest(ticket) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="demo-pill">DRAFT</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Privacy request</h1>
      <p className="mt-2 text-ink">Ask for access, correction, deletion, or an opt-out of sale or sharing. The ticket stays in this browser and shows up in the demo admin log. This does not decide whether a state privacy law applies.</p>
      <form className="mt-6 grid gap-3" onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const row = createPrivacyRequest({
            name: String(data.get('name') || ''),
            email: String(data.get('email') || ''),
            type: String(data.get('type') || 'access') as 'access' | 'correction' | 'deletion' | 'opt_out_sale',
            details: String(data.get('details') || ''),
          });
          setTicket(row.id);
          setError('');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Name<input name="name" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Request type
          <select name="type" defaultValue={params.get('type') ?? 'access'} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3">
            <option value="access">Access</option>
            <option value="correction">Correction</option>
            <option value="deletion">Deletion</option>
            <option value="opt_out_sale">Opt out of sale or sharing</option>
          </select>
        </label>
        <label className="text-sm">Details<textarea name="details" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <button type="submit" data-testid="privacy-submit" className="min-h-11 rounded-full bg-pink font-semibold text-white">Submit request</button>
      </form>
      {ticket ? <p className="mt-4 text-sm">Ticket <span data-testid="privacy-ticket">{ticket}</span>{found ? ` · ${found.status}${found.resolution ? ` · ${found.resolution}` : ''}` : ''}</p> : null}
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
      <p className="mt-4 text-sm">Contact {CONTACT_EMAIL}. <Link className="text-purple" href="/do-not-sell-or-share/">Do not sell or share</Link></p>
    </div>
  );
}

export function DataDeletionView() {
  const { user, switchUser } = useDemo();
  const [result, setResult] = useState<{ removed: string[]; retained: string[] } | null>(null);
  const [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="demo-pill">DRAFT</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Data deletion and export</h1>
      <p className="mt-2 text-ink">Export downloads your demo records. Deletion anonymizes your account in this browser. An audit line is kept without your old email. No card data exists to retain.</p>
      {user ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-full bg-navy px-4 font-semibold text-white" onClick={() => {
            const blob = new Blob([exportData(actorFrom(user))], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'legalgrads-demo-export.json'; a.click();
            URL.revokeObjectURL(url);
          }}>Download export</button>
          <button type="button" className="min-h-11 rounded-full bg-pink px-4 font-semibold text-white" onClick={() => {
            try { setResult(deleteAccount(actorFrom(user))); switchUser(null); setError(''); }
            catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
          }}>Delete demo account</button>
        </div>
      ) : <p className="mt-4">Log in to export or delete a demo account. You can still file a <Link className="text-purple" href="/privacy-request/">privacy request</Link>.</p>}
      {result ? (
        <div className="mt-4 text-sm">
          <p>Removed: {result.removed.join(', ')}</p>
          <p>Retained: {result.retained.join(', ')}</p>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
    </div>
  );
}

export function ContactView() {
  return <TicketForm title="Contact" intro={`Write to the demo. Nothing is emailed. The public address is ${CONTACT_EMAIL}. There is no street address or phone number in this demo.`} targetType="contact" />;
}

export function ReportView() {
  return <TicketForm title="Report abuse" intro="Report a profile, message, or other demo issue. A demo admin can acknowledge the ticket. This is not a report to a regulator." targetType="attorney" />;
}

function TicketForm({ title, intro, targetType }: { title: string; intro: string; targetType: string }) {
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">{title}</h1>
      <p className="mt-2 text-ink">{intro}</p>
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = String(data.get('email') || '');
        if (!validEmail(email)) { setError('Enter a valid email.'); return; }
        try {
          const row = createReport({ email, targetType: String(data.get('targetType') || targetType), targetId: String(data.get('targetId') || ''), details: String(data.get('details') || '') });
          setId(row.id);
          setError('');
        } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
      }}>
        <label className="text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">What is this about?
          <select name="targetType" defaultValue={targetType} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3">
            <option value="contact">General contact</option>
            <option value="attorney">Attorney profile</option>
            <option value="review">Review</option>
            <option value="message">Message</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label className="text-sm">Profile or page<input name="targetId" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <label className="text-sm">Details<textarea name="details" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" /></label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-semibold text-white">Send</button>
      </form>
      {id ? <p role="status" className="mt-3 text-sm">Ticket {id} is open in the demo admin log. No email was sent.</p> : null}
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}
    </div>
  );
}

export function NotificationsView() {
  const { user } = useDemo();
  if (!user) return <div className="mx-auto max-w-xl px-4 py-10"><h1 className="font-display text-4xl font-extrabold">Notifications</h1><p className="mt-2">Log in to see simulated alerts. No email is sent.</p></div>;
  const rows = getState().notifications.filter((n) => n.userId === user.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold">Notifications</h1>
      <ul className="mt-4 space-y-2">{rows.map((row) => <li key={row.id} className="rounded-2xl bg-white p-3 text-sm"><Link href={row.href}>{row.body}</Link></li>)}</ul>
    </div>
  );
}
