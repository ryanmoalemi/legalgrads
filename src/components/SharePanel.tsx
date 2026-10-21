'use client';

import { useState } from 'react';
import { joinedLabel } from '@/lib/joined';
import { INVITE_URL, downloadShareCard, inviteClassmate } from '@/lib/share';

export function SharePanel({ name, joined }: { name: string; joined?: string | number | Date | null }) {
  const [note, setNote] = useState('');
  const label = joinedLabel(joined);
  return (
    <div className="rounded-3xl bg-white p-5" data-testid="share-panel">
      <p className="inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{label}</p>
      <p className="mt-2 text-sm text-ink">{label} is only the year you joined Legalgrads. It is not a rating and not a benefit to clients.</p>
      <h2 className="mt-3 font-display text-2xl font-extrabold">Share that you&apos;re applying</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-navy px-4 font-display text-sm font-semibold text-white" onClick={() => downloadShareCard(name || 'Your name', joined)}>Download “I&apos;m on Legalgrads”</button>
        <button type="button" data-testid="invite-classmate" className="min-h-11 rounded-full bg-white px-4 font-display text-sm font-semibold text-navy ring-1 ring-navy/10" onClick={() => void inviteClassmate().then(setNote)}>Invite a classmate</button>
      </div>
      <p className="mt-3 text-sm text-ink">Invite link: <a className="font-semibold text-purple" href={INVITE_URL}>{INVITE_URL}</a></p>
      {note ? <p role="status" className="mt-2 text-sm">{note}</p> : null}
    </div>
  );
}
