'use client';

import { FormEvent, useState } from 'react';
import { messageProblems, sendAttorneyMessage } from '@/lib/messages';
import { inputClass } from '@/components/ui';

const fieldClass = `${inputClass} mt-2 min-h-12 text-base`;

export function MessageAttorneyForm({ profileId }: { profileId?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event?: FormEvent) {
    event?.preventDefault();
    const found = messageProblems({ profileId, name, email, phone, body, consent, honeypot });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-testid="message-attorney"] [aria-invalid="true"]')?.focus();
      });
      return;
    }
    if (!profileId) {
      setStatus('This sample does not send. On a live listing, your email stays private and the attorney gets the message through Legalgrads.');
      return;
    }
    setBusy(true);
    const result = await sendAttorneyMessage({ profileId, name, email, phone, body, consent, honeypot });
    setBusy(false);
    setStatus(result.message);
    if (result.ok && !honeypot.trim()) {
      setBody('');
      setConsent(false);
    }
  }

  return (
    <div
      data-testid="message-attorney"
      role="form"
      aria-labelledby="message-attorney-title"
      className="relative mt-4 rounded-3xl bg-[#FFF8F1] p-4"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.target as HTMLElement).tagName !== 'TEXTAREA') event.preventDefault();
      }}
    >
      <h3 id="message-attorney-title" className="font-display text-lg font-extrabold">Message this attorney</h3>
      <p className="mt-1 text-sm text-ink">Your email stays private. The attorney’s email stays private. Legalgrads relays the message.</p>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input data-testid="message-honeypot" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
        </label>
      </div>
      <label className="mt-3 block text-sm font-semibold" htmlFor="message-name">Your name
        <input id="message-name" data-testid="message-name" className={fieldClass} autoComplete="name" value={name} aria-invalid={errors.name ? true : undefined} onChange={(event) => setName(event.target.value)} />
      </label>
      {errors.name ? <p role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.name}</p> : null}
      <label className="mt-3 block text-sm font-semibold" htmlFor="message-email">Your email
        <input id="message-email" data-testid="message-email" type="email" autoComplete="email" className={fieldClass} value={email} aria-invalid={errors.email ? true : undefined} onChange={(event) => setEmail(event.target.value)} />
      </label>
      {errors.email ? <p role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.email}</p> : null}
      <label className="mt-3 block text-sm font-semibold" htmlFor="message-phone">Phone, optional
        <input id="message-phone" data-testid="message-phone" type="tel" autoComplete="tel" className={fieldClass} value={phone} aria-invalid={errors.phone ? true : undefined} onChange={(event) => setPhone(event.target.value)} />
      </label>
      {errors.phone ? <p role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.phone}</p> : null}
      <label className="mt-3 block text-sm font-semibold" htmlFor="message-body">Message
        <span className="mt-1 block font-normal text-ink">No links. Describe your situation in words.</span>
        <textarea id="message-body" data-testid="message-body" className={fieldClass} rows={4} value={body} aria-invalid={errors.body ? true : undefined} onChange={(event) => setBody(event.target.value)} />
      </label>
      {errors.body ? <p role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.body}</p> : null}
      <label className="mt-3 flex min-h-14 items-start gap-3 text-sm">
        <input data-testid="message-consent" className="mt-1 h-5 w-5" type="checkbox" checked={consent} aria-invalid={errors.consent ? true : undefined} onChange={(event) => setConsent(event.target.checked)} />
        <span>Relay this message to the attorney. Do not show my email address.</span>
      </label>
      {errors.consent ? <p role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.consent}</p> : null}
      <button type="button" data-testid="message-submit" disabled={busy} className="mt-3 min-h-12 w-full rounded-full bg-navy px-4 font-display text-base font-semibold text-white disabled:opacity-50" onClick={() => void onSubmit()}>{busy ? 'Sending…' : 'Send message'}</button>
      {status ? <p role="status" data-testid="message-status" className="mt-2 text-sm">{status}</p> : null}
    </div>
  );
}
