'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { actorFrom, useDemo } from '@/components/DemoProvider';
import { DemoMark, Notice, StatusPill } from '@/components/ui';
import {
  acceptProposal,
  addMilestone,
  attachDemoFile,
  cancelAppointment,
  clearConflict,
  completeMatter,
  confirmAppointment,
  declineLead,
  declineProposal,
  editReview,
  flagConflict,
  getConversation,
  getInquiry,
  getMatter,
  getState,
  listAppointments,
  markConversationRead,
  proposeSlot,
  requestReschedule,
  sendMessage,
  sendProposal,
  setMilestone,
  submitReview,
} from '@/lib/db';
import { AccessDeniedError } from '@/lib/db';
import { formatWhen, money } from '@/lib/format';
import type { Inquiry } from '@/lib/types';

export function AccessDenied() {
  return <div data-testid="access-denied" role="alert" className="rounded-3xl bg-white p-6">Access denied. You can only read your own inquiries.</div>;
}

export function Thread({ conversationId }: { conversationId: string }) {
  const { user, rev } = useDemo();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const actor = actorFrom(user);
  useEffect(() => {
    if (user) {
      try { markConversationRead(actorFrom(user), conversationId); } catch { /* not a member */ }
    }
  }, [conversationId, user, rev]);
  let data: ReturnType<typeof getConversation> | null = null;
  let denied = false;
  let missing = false;
  try {
    data = user ? getConversation(actor, conversationId) : null;
  } catch (err) {
    if (err instanceof AccessDeniedError) denied = true;
    else missing = true;
  }
  if (denied) return <AccessDenied />;
  if (missing) return <p>Conversation not found.</p>;

  if (!data) return null;
  return (
    <div>
      <p className="text-xs text-ink">Before an engagement, do not share privileged or highly sensitive facts.</p>
      <ul data-testid="message-list" className="mt-3 max-h-80 space-y-2 overflow-auto">
        {data.messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-cream px-3 py-2 text-sm">
            <span className="font-semibold">{getState().users.find((u) => u.id === message.senderId)?.name ?? 'Demo'}</span>
            <span className="ml-2 text-xs text-ink">{formatWhen(message.createdAt)}</span>
            {message.kind === 'attachment' ? <span className="ml-2 demo-pill">DEMO file</span> : null}
            <p>{message.body}</p>
          </li>
        ))}
      </ul>
      <form className="mt-3 flex flex-col gap-2" onSubmit={(event) => {
        event.preventDefault();
        try {
          sendMessage(actor, conversationId, body);
          setBody('');
          setError('');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not send.');
        }
      }}>
        <label className="text-sm font-medium">Message
          <textarea data-testid="message-body" value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" rows={2} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" data-testid="send-message" className="min-h-11 rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">Send</button>
          <button type="button" className="min-h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-navy/10" onClick={() => attachDemoFile(actor, conversationId)}>Attach demo file</button>
        </div>
        {error ? <p role="alert" className="text-sm text-pink">{error}</p> : null}
      </form>
    </div>
  );
}

export function InquiryDetail({ id, side }: { id: string; side: 'client' | 'attorney' }) {
  const { user, rev } = useDemo();
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  if (!user) return <p>Sign in to view this request.</p>;
  const actor = actorFrom(user);
  let inquiry: Inquiry;
  try {
    inquiry = getInquiry(actor, id);
  } catch (err) {
    if (err instanceof AccessDeniedError) return <AccessDenied />;
    return <p>Inquiry not found.</p>;
  }
  const db = getState();
  const attorney = db.users.find((u) => u.id === inquiry.attorneyId);
  const client = db.users.find((u) => u.id === inquiry.clientId);
  const convo = db.conversations.find((c) => c.inquiryId === inquiry.id);
  const proposal = db.proposals.find((p) => p.inquiryId === inquiry.id && p.status === 'sent') ?? db.proposals.find((p) => p.inquiryId === inquiry.id);
  const conflict = db.conflictChecks.find((c) => c.inquiryId === inquiry.id);
  const appointments = db.appointments.filter((a) => a.inquiryId === inquiry.id);
  const slots = db.availabilitySlots.filter((s) => s.attorneyId === inquiry.attorneyId && s.status === 'open');
  const matter = db.matters.find((m) => m.inquiryId === inquiry.id);
  const profile = db.attorneyProfiles.find((p) => p.userId === inquiry.attorneyId);

  function run(action: () => void) {
    try {
      action();
      setError('');
      setNote('Saved in this browser.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <article className="rounded-3xl bg-white p-5" data-rev={rev}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-extrabold">{side === 'attorney' ? client?.name : attorney?.name}</h2>
        <StatusPill status={inquiry.status} />
        <DemoMark />
      </div>
      <p className="mt-2 text-sm text-ink">{inquiry.description}</p>
      <p className="mt-1 text-sm">Jurisdiction {inquiry.jurisdiction} · Budget {inquiry.budget} · {inquiry.urgency}</p>
      {conflict ? <p className="mt-2 text-sm">Conflict check: {conflict.status}. {conflict.notes}</p> : null}
      {proposal ? (
        <div className="mt-4 rounded-2xl bg-cream p-4">
          <h3 className="font-display font-extrabold">Proposal · {proposal.status}</h3>
          <p className="text-sm">{proposal.scope}</p>
          <p className="mt-1 text-sm">Deliverables: {proposal.deliverables}</p>
          <p className="text-sm">Exclusions: {proposal.exclusions}</p>
          <p className="text-sm">Revisions: {proposal.revisions}</p>
          <p className="mt-1 font-semibold">{money(proposal.price)} fixed · DEMO · Deadline {proposal.deadline} · Jurisdiction {proposal.jurisdiction}</p>
          {side === 'client' && proposal.status === 'sent' ? (
            <form className="mt-3" onSubmit={(event) => {
              event.preventDefault();
              const confirmed = (event.currentTarget.elements.namedItem('pay') as HTMLInputElement).checked;
              run(() => acceptProposal(actor, proposal.id, confirmed));
            }}>
              <label className="flex items-start gap-2 text-sm">
                <input name="pay" type="checkbox" data-testid="payment-confirm" className="mt-1" />
                <span>Demo payment — no money charged. I confirm this simulated payment of {money(proposal.price)}.</span>
              </label>
              <div className="mt-3 flex gap-2">
                <button type="submit" data-testid="accept-proposal" className="min-h-11 rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">Accept engagement</button>
                <button type="button" className="min-h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-navy/10" onClick={() => run(() => declineProposal(actor, proposal.id))}>Decline</button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {side === 'attorney' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white" onClick={() => run(() => clearConflict(actor, inquiry.id))} data-testid="conflict-clear">Mark conflicts cleared</button>
          <button type="button" className="min-h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-navy/10" onClick={() => run(() => flagConflict(actor, inquiry.id))}>Conflict found</button>
          <button type="button" className="min-h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-navy/10" onClick={() => run(() => declineLead(actor, inquiry.id, 'Declined in the demo.'))}>Decline</button>
        </div>
      ) : null}

      {side === 'attorney' && !proposal ? (
        <form className="mt-4 grid gap-2" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => sendProposal(actor, inquiry.id, {
            scope: String(data.get('scope') || ''),
            price: Number(data.get('price') || 0),
            deadline: String(data.get('deadline') || ''),
            deliverables: String(data.get('deliverables') || ''),
            exclusions: String(data.get('exclusions') || ''),
            revisions: String(data.get('revisions') || ''),
          }));
        }}>
          <h3 className="font-display font-extrabold">Send engagement terms</h3>
          <label className="text-sm">Scope<textarea name="scope" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" defaultValue="Fictional demo fixed-fee help. Not legal advice until accepted." /></label>
          <label className="text-sm">Price (demo dollars)<input data-testid="proposal-price" name="price" type="number" min={0} defaultValue={350} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <label className="text-sm">Deadline<input name="deadline" type="date" required defaultValue="2026-12-15" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <label className="text-sm">Deliverables<input name="deliverables" defaultValue="Written comments" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <label className="text-sm">Exclusions<input name="exclusions" defaultValue="No court appearance" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <label className="text-sm">Revisions<input name="revisions" defaultValue="One round" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" /></label>
          <button type="submit" data-testid="send-proposal" className="min-h-11 rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">Send proposal</button>
        </form>
      ) : null}

      <div className="mt-4">
        <h3 className="font-display font-extrabold">Times</h3>
        <ul className="mt-2 space-y-2">
          {appointments.map((appt) => (
            <li key={appt.id} className="rounded-2xl bg-cream px-3 py-2 text-sm">
              <StatusPill status={appt.status} /> {formatWhen(db.availabilitySlots.find((s) => s.id === appt.slotId)?.startAtUtc ?? appt.createdAt, profile?.timezone)}
              {appt.meetingLink ? <p>Simulated video link (not a live room): {appt.meetingLink}</p> : null}
              {side === 'client' && (appt.status === 'proposed' || appt.status === 'requested') ? (
                <button type="button" data-testid="confirm-appointment" className="ml-2 min-h-11 rounded-full bg-pink px-3 text-white" onClick={() => run(() => confirmAppointment(actor, appt.id))}>Confirm slot</button>
              ) : null}
              <button type="button" className="ml-2 min-h-11 text-sm font-semibold text-purple" onClick={() => run(() => requestReschedule(actor, appt.id, 'Please propose another demo time.'))}>Request reschedule</button>
              <button type="button" className="ml-2 min-h-11 text-sm font-semibold" onClick={() => run(() => cancelAppointment(actor, appt.id))}>Cancel</button>
            </li>
          ))}
        </ul>
        {side === 'attorney' ? (
          <ul className="mt-2 space-y-2">
            {slots.map((slot) => (
              <li key={slot.id}>
                <button type="button" data-testid="propose-slot" className="min-h-11 rounded-full bg-white px-3 text-sm font-semibold ring-1 ring-navy/10" onClick={() => run(() => proposeSlot(actor, inquiry.id, slot.id))}>
                  Propose {formatWhen(slot.startAtUtc, profile?.timezone)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {matter ? <p className="mt-4 text-sm">Matter <span data-testid="matter-status">{matter.status}</span> · <Link className="text-purple" href={side === 'client' ? `/client/matters/?id=${matter.id}` : `/attorney/matters/?id=${matter.id}`}>Open matter</Link></p> : null}
      {convo ? <div className="mt-4"><Thread conversationId={convo.id} /></div> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {note ? <Notice>{note}</Notice> : null}
    </article>
  );
}

export function MatterDetail({ id, side }: { id: string; side: 'client' | 'attorney' }) {
  const { user } = useDemo();
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  if (!user) return null;
  const actor = actorFrom(user);
  let matter;
  try {
    matter = getMatter(actor, id);
  } catch (err) {
    if (err instanceof AccessDeniedError) return <AccessDenied />;
    return <p>Matter not found.</p>;
  }
  const db = getState();
  const milestones = db.matterMilestones.filter((m) => m.matterId === matter.id);
  const payment = db.demoPayments.find((p) => p.matterId === matter.id);
  const review = db.reviews.find((r) => r.matterId === matter.id);
  const convo = db.conversations.find((c) => c.matterId === matter.id || c.inquiryId === matter.inquiryId);

  function run(action: () => void) {
    try { action(); setError(''); setNote('Saved.'); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
  }

  return (
    <article className="rounded-3xl bg-white p-5">
      <h2 className="font-display text-2xl font-extrabold">Matter</h2>
      <p data-testid="matter-status" className="mt-1">{matter.status} <DemoMark /></p>
      {payment ? <p className="mt-2 text-sm">Demo payment — no money charged. Status {payment.status}. Amount {money(payment.amount)}. Simulated.</p> : null}
      <ul className="mt-4 space-y-2">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="flex flex-wrap items-center gap-2 text-sm">
            <StatusPill status={milestone.status} /> {milestone.title} · due {milestone.dueAt}
            {side === 'attorney' ? (
              <button type="button" className="min-h-11 text-purple" onClick={() => run(() => setMilestone(actor, milestone.id, milestone.status === 'done' ? 'pending' : 'done'))}>Toggle</button>
            ) : null}
          </li>
        ))}
      </ul>
      {side === 'attorney' ? (
        <form className="mt-3 flex gap-2" onSubmit={(event) => {
          event.preventDefault();
          const title = String(new FormData(event.currentTarget).get('title') || '');
          run(() => addMilestone(actor, matter.id, title));
          event.currentTarget.reset();
        }}>
          <label className="sr-only" htmlFor="ms-title">Milestone</label>
          <input id="ms-title" name="title" className="flex-1 rounded-full border border-navy/10 px-3" placeholder="New milestone" />
          <button type="submit" className="min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white">Add</button>
        </form>
      ) : null}
      {side === 'attorney' && matter.status === 'active' ? (
        <button type="button" data-testid="complete-matter" className="mt-4 min-h-11 rounded-full bg-pink px-4 font-display font-semibold text-white" onClick={() => run(() => completeMatter(actor, matter.id))}>Mark matter completed</button>
      ) : null}
      {side === 'client' && matter.status === 'completed' && !review ? (
        <form className="mt-4" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => submitReview(actor, matter.id, Number(data.get('rating')), String(data.get('text') || '')));
        }}>
          <h3 className="font-display font-extrabold">Leave a fictional demo review</h3>
          <label className="mt-2 block text-sm">Rating
            <select name="rating" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select>
          </label>
          <label className="mt-2 block text-sm">Review
            <textarea data-testid="review-text" name="text" required className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <button type="submit" data-testid="submit-review" className="mt-3 min-h-11 rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">Submit fictional review</button>
        </form>
      ) : null}
      {review && side === 'client' ? (
        <form className="mt-4" onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => editReview(actor, review.id, Number(data.get('rating')), String(data.get('text') || '')));
        }}>
          <p className="demo-pill">Fictional demo review</p>
          <label className="mt-2 block text-sm">Edit review
            <textarea name="text" defaultValue={review.text} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <input type="hidden" name="rating" value={review.rating} />
          <button type="submit" className="mt-2 min-h-11 rounded-full bg-white px-4 text-sm font-semibold ring-1 ring-navy/10">Save edit</button>
        </form>
      ) : null}
      {convo ? <div className="mt-4"><Thread conversationId={convo.id} /></div> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {note ? <Notice>{note}</Notice> : null}
    </article>
  );
}

export function AppointmentList({ side }: { side: 'client' | 'attorney' }) {
  const { user } = useDemo();
  if (!user) return null;
  const rows = listAppointments(actorFrom(user));
  const db = getState();
  if (!rows.length) return <p>No appointments yet.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((appt) => {
        const slot = db.availabilitySlots.find((s) => s.id === appt.slotId);
        const other = side === 'client' ? db.users.find((u) => u.id === appt.attorneyId) : db.users.find((u) => u.id === appt.clientId);
        return (
          <li key={appt.id} className="rounded-3xl bg-white p-4">
            <StatusPill status={appt.status} /> <span className="font-semibold">{other?.name}</span>
            <p className="mt-1 text-sm">{slot ? formatWhen(slot.startAtUtc) : 'Time unavailable'} · {appt.meetingMode}</p>
            {appt.meetingLink ? <p className="text-sm">Simulated video link: {appt.meetingLink} <DemoMark /></p> : null}
            {side === 'client' && (appt.status === 'proposed' || appt.status === 'requested') ? (
              <button type="button" data-testid="confirm-appointment" className="mt-2 min-h-11 rounded-full bg-pink px-4 text-sm font-semibold text-white" onClick={() => confirmAppointment(actorFrom(user), appt.id)}>Confirm slot</button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
