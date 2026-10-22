'use client';

import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { analyticsLog, readConsent, track, writeConsent } from '@/lib/consent';
import { mailtoHref } from '@/lib/mailto';
import { validEmail } from '@/lib/format';
import { CONTACT_EMAIL } from '@/lib/site';
import { PageIntro } from '@/components/ui';

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
      <PageIntro title="Cookie settings" body="Necessary storage stays on. Optional categories start off. Nothing here loads a third-party tracker." />
      <form className="mt-6 grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        writeConsent({ analytics, marketing });
        setStatus('Preferences saved on this device.');
        setLog(analyticsLog());
      }}>
        <label className="flex items-center gap-2"><input type="checkbox" checked disabled /> Strictly necessary (always on)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /> Analytics</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /> Marketing</label>
        <button type="submit" className="min-h-11 rounded-full bg-navy px-4 font-semibold text-white">Save preferences</button>
      </form>
      <button type="button" data-testid="analytics-event" className="mt-4 min-h-11 rounded-full bg-pink px-4 font-semibold text-white" onClick={() => {
        const result = track('analytics', 'page_view');
        setStatus(result.reason);
        setLog(analyticsLog());
      }}>Send a test analytics event</button>
      <p data-testid="analytics-status" role="status" className="mt-3 text-sm">{status}</p>
      <ul className="mt-3 text-xs text-ink">{log.map((row, index) => <li key={`${row.at}-${index}`}>{row.channel}: {row.name}</li>)}</ul>
    </div>
  );
}

function MailtoForm({
  title,
  body,
  subject,
  detailsLabel,
  extra,
}: {
  title: string;
  body: string;
  subject: string;
  detailsLabel: string;
  extra?: ReactNode;
}) {
  const [mailto, setMailto] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '');
    const details = String(data.get('details') || '');
    const name = String(data.get('name') || '');
    const type = String(data.get('type') || '');
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      setMailto('');
      return;
    }
    if (details.trim().length < 8) {
      setError('Add a few details so the request is not empty.');
      setMailto('');
      return;
    }
    setError('');
    const lines = [
      title,
      '',
      name ? `Name: ${name}` : null,
      `Email: ${email}`,
      type ? `Type: ${type}` : null,
      '',
      details.trim(),
    ].filter(Boolean).join('\n');
    setMailto(mailtoHref(subject, lines));
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title={title} body={body} />
      <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
        <label className="text-sm font-medium">Name
          <input name="name" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
        </label>
        <label className="text-sm font-medium">Email
          <input name="email" type="email" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
        </label>
        {extra}
        <label className="text-sm font-medium">{detailsLabel}
          <textarea name="details" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" rows={5} />
        </label>
        <button type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Prepare email</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {mailto ? (
        <p className="mt-4 text-sm" role="status">
          Nothing is stored until you send this message.{' '}
          <a data-testid="prepared-mailto" className="font-semibold text-purple" href={mailto}>Email {CONTACT_EMAIL}</a>
        </p>
      ) : null}
    </div>
  );
}

export function ContactView() {
  return (
    <MailtoForm
      title="Contact"
      body={`Write to ${CONTACT_EMAIL}. Preparing the email keeps every field you type. Send it from your own mail app.`}
      subject="Legalgrads contact"
      detailsLabel="Message"
    />
  );
}

export function PrivacyRequestView() {
  return (
    <MailtoForm
      title="Privacy request"
      body={`Ask Legalgrads for access, correction, or deletion. The message goes to ${CONTACT_EMAIL}. Send the email to finish the request.`}
      subject="Legalgrads privacy request"
      detailsLabel="Details"
      extra={(
        <label className="text-sm font-medium">Request type
          <select name="type" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" defaultValue="access">
            <option value="access">Access</option>
            <option value="correction">Correction</option>
            <option value="deletion">Deletion</option>
            <option value="opt_out_sale">Opt out of sale or sharing</option>
          </select>
        </label>
      )}
    />
  );
}

export function DeletionView() {
  return (
    <MailtoForm
      title="Data deletion"
      body={`Email ${CONTACT_EMAIL} and ask us to delete the address or application you name. We do not delete anything until that email is sent.`}
      subject="Legalgrads deletion request"
      detailsLabel="What should we delete?"
    />
  );
}

export function ReportView() {
  return (
    <MailtoForm
      title="Report a listing"
      body="Tell us which listing and what is wrong. Legalgrads can unpublish a profile after review."
      subject="Legalgrads listing report"
      detailsLabel="What happened?"
    />
  );
}
