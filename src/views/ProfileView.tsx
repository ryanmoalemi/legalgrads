'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { stateName } from '@/lib/catalog';
import { actorFrom, useDemo } from '@/components/DemoProvider';
import { DemoMark, Notice, Skeleton } from '@/components/ui';
import {
  attorneyBySlug,
  createInquiry,
  getState,
  initDb,
  isFavorite,
  openSlots,
  reportReview,
  reviewsFor,
  servicesFor,
  toggleFavorite,
} from '@/lib/db';
import { formatWhen, money } from '@/lib/format';
import type { AttorneyCard, Service } from '@/lib/types';

export function ProfileView() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const slug = String(params.slug || '');
  const { ready, user, rev } = useDemo();
  const [card, setCard] = useState<AttorneyCard | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void initDb().then(() => {
      const next = attorneyBySlug(slug);
      setCard(next);
      setServices(next ? servicesFor(next.userId) : []);
      if (next && user && search.get('resume') === 'save' && user.role === 'client' && !isFavorite(user.id, next.userId)) {
        toggleFavorite(actorFrom(user), next.userId);
        router.replace(`/attorneys/${slug}/`);
      }
    });
  }, [slug, rev, ready, user, search, router]);

  if (!ready || !card) return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-80" /></div>;
  const saved = user?.role === 'client' && isFavorite(user.id, card.userId);
  const reviews = reviewsFor(card.userId);
  const slots = openSlots(card.userId).filter((s) => s.status === 'open');
  const specialties = getState().specialties.filter((s) => card.specialtySlugs.includes(s.slug));

  function requireClient(resume: string) {
    if (!user || user.role !== 'client') {
      router.push(`/login/?next=${encodeURIComponent(`/attorneys/${slug}/?resume=${resume}`)}`);
      return false;
    }
    return true;
  }

  function onConsult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireClient('consult')) return;
    const data = new FormData(event.currentTarget);
    try {
      const inquiry = createInquiry(actorFrom(user), {
        attorneyId: card!.userId,
        specialtyId: String(data.get('specialty') || specialties[0]?.id),
        kind: 'consultation',
        description: String(data.get('description') || ''),
        budget: String(data.get('budget') || 'Not sure'),
        urgency: String(data.get('urgency') || 'Flexible'),
        jurisdiction: String(data.get('jurisdiction') || card!.licenseJurisdictions[0]),
        contactPreference: String(data.get('contact') || 'In-app demo messages'),
        durationMinutes: Number(data.get('duration') || 30),
        slotId: String(data.get('slot') || '') || null,
      });
      setError('');
      setMessage('Request sent. It is now on your client dashboard and the attorney’s lead list.');
      router.push(`/client/requests/?id=${inquiry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.');
    }
  }

  function onQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireClient('quote')) return;
    const data = new FormData(event.currentTarget);
    try {
      const inquiry = createInquiry(actorFrom(user), {
        attorneyId: card!.userId,
        specialtyId: specialties[0].id,
        serviceId: String(data.get('service') || '') || null,
        kind: data.get('service') ? 'fixed_price' : 'quote',
        description: String(data.get('description') || ''),
        budget: String(data.get('budget') || 'Not sure'),
        urgency: String(data.get('deadline') || 'Flexible'),
        jurisdiction: card!.licenseJurisdictions[0],
        contactPreference: 'In-app demo messages',
        durationMinutes: 30,
      });
      setMessage('Quote request sent.');
      router.push(`/client/requests/?id=${inquiry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the quote.');
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="demo-pill">Fictional demo</p>
        <div className="mt-3 grid gap-4 rounded-3xl bg-white p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
          <img src={card.photoUrl} alt={`Fictional demo portrait of ${card.displayName}`} className="h-64 w-full rounded-2xl object-cover object-top" />
          <div>
            <h1 className="font-display text-4xl font-extrabold">{card.displayName}</h1>
            <p className="mt-1 text-ink">{card.city} · {card.licenseJurisdictions.map(stateName).join(', ')}</p>
            <p className="mt-1">Newly licensed badge · Class of {card.graduationYear} · {card.lawSchool}</p>
            <p className="text-sm text-ink">Fictional demo education. Not a claim that this person attended that school.</p>
            <p className="mt-3 font-display text-2xl font-extrabold">{money(card.hourlyRate)}/hr <DemoMark /></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {card.cardTags.map((tag) => <span key={tag} className="rounded-full bg-[#F4EEFF] px-3 py-1 text-sm font-semibold text-purple">{tag}</span>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="#consult" className="inline-flex min-h-11 items-center rounded-full bg-pink px-4 font-display text-sm font-semibold text-white">Request Consultation</a>
              <button type="button" className="min-h-11 rounded-full bg-cream px-4 font-display text-sm font-semibold" onClick={() => {
                if (!requireClient('message')) return;
                try {
                  const inquiry = createInquiry(actorFrom(user), {
                    attorneyId: card.userId,
                    specialtyId: specialties[0].id,
                    kind: 'message',
                    description: 'Fictional demo message thread. No sensitive facts.',
                    budget: 'Not sure',
                    urgency: 'Flexible',
                    jurisdiction: card.licenseJurisdictions[0],
                    contactPreference: 'In-app',
                    durationMinutes: 30,
                  });
                  router.push(`/client/requests/?id=${inquiry.id}`);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not message.');
                }
              }}>Message</button>
              <button type="button" data-testid="save-attorney" className="min-h-11 rounded-full bg-white px-4 font-display text-sm font-semibold ring-1 ring-navy/10" onClick={() => {
                if (!requireClient('save')) return;
                toggleFavorite(actorFrom(user), card.userId);
              }}>{saved ? 'Saved' : 'Save'}</button>
            </div>
          </div>
        </div>

        {!card.bookable ? <p role="status" className="mt-4 rounded-2xl bg-orange/10 px-4 py-3 text-sm">{card.unavailableReason} Booking is turned off.</p> : null}

        <section className="mt-6">
          <h2 className="font-display text-2xl font-extrabold">About</h2>
          <p className="mt-2 leading-7 text-ink">{card.bio}</p>
          <p className="mt-2 text-sm text-ink">Languages: {card.languages.join(', ')}. Work format: {card.remoteAllowed ? 'Remote' : ''} {card.inPersonAllowed ? 'In person' : ''}. Time zone {card.timezone}.</p>
        </section>

        <section className="mt-6" data-testid="verification-badge">
          <h2 className="font-display text-2xl font-extrabold">Verification</h2>
          <p className="mt-2 text-sm text-ink">DEMO verified only when the simulated record says approved. This is not a real bar lookup.</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Status: {card.verificationStatus} · simulated</li>
            <li>License status: {card.licenseStatus}</li>
            <li>Jurisdiction: {card.licenseJurisdictions.map(stateName).join(', ')}</li>
            <li>Simulated verification date: {card.verificationDate ?? 'Not approved'}</li>
            <li>Bar number: none. No real bar number is stored.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-2xl font-extrabold">Services</h2>
          <ul className="mt-3 space-y-3">
            {services.map((service) => (
              <li key={service.id} className="rounded-3xl bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-extrabold">{service.title}</h3>
                  <p className="font-display font-extrabold">{money(service.fixedPrice)} <DemoMark /></p>
                </div>
                <p className="mt-1 text-sm text-ink">{service.scope}</p>
                <p className="mt-1 text-sm">Deliverables: {service.deliverables}</p>
                <p className="text-sm">Exclusions: {service.exclusions}</p>
                <p className="text-sm">Turnaround about {service.turnaroundDays} days. Consultation included: {service.consultationIncluded ? 'yes' : 'no'}.</p>
                <button type="button" className="mt-3 min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-white" onClick={() => {
                  if (!requireClient('service')) return;
                  try {
                    const inquiry = createInquiry(actorFrom(user), {
                      attorneyId: card.userId,
                      specialtyId: specialties[0].id,
                      serviceId: service.id,
                      kind: 'fixed_price',
                      description: `Selected fictional service: ${service.title}`,
                      budget: money(service.fixedPrice),
                      urgency: `${service.turnaroundDays} days`,
                      jurisdiction: card.licenseJurisdictions[0],
                      contactPreference: 'In-app',
                      durationMinutes: 30,
                    });
                    router.push(`/client/requests/?id=${inquiry.id}`);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not select the service.');
                  }
                }}>Select fixed-price service</button>
              </li>
            ))}
            {services.length === 0 ? <li className="text-sm text-ink">No fixed-price services published.</li> : null}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-2xl font-extrabold">Reviews</h2>
          <p className="mt-1 text-sm text-ink">Seed and new reviews are fictional demonstration content. A new attorney can have zero reviews.</p>
          {reviews.length === 0 ? <p className="mt-3">No reviews yet.</p> : (
            <ul className="mt-3 space-y-3">
              {reviews.map((review) => (
                <li key={review.id} data-testid="demo-review" className="rounded-3xl bg-white p-4">
                  <p className="demo-pill">Fictional demo review</p>
                  <p className="mt-2 font-semibold">{review.rating} / 5 · DEMO</p>
                  <p className="mt-1">{review.text}</p>
                  <button type="button" className="mt-2 text-sm font-semibold text-purple" onClick={() => {
                    if (!user) { router.push('/login/'); return; }
                    reportReview(actorFrom(user), review.id, 'Reported from profile');
                    setMessage('Review reported for demo moderation.');
                  }}>Report review</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <h2 className="font-display text-2xl font-extrabold">FAQ</h2>
          <details className="mt-2 rounded-2xl bg-white p-4"><summary className="cursor-pointer font-semibold">Does messaging hire this attorney?</summary><p className="mt-2 text-sm text-ink">No. Conflict review and a separate engagement come first.</p></details>
          <details className="mt-2 rounded-2xl bg-white p-4"><summary className="cursor-pointer font-semibold">Is the license real?</summary><p className="mt-2 text-sm text-ink">No. Verification is simulated and there is no real bar number.</p></details>
        </section>
      </div>

      <aside className="space-y-4">
        <form id="consult" data-testid="consultation-form" className="rounded-3xl bg-white p-4" onSubmit={onConsult}>
          <h2 className="font-display text-xl font-extrabold">Request a consultation</h2>
          <p className="mt-1 text-xs text-ink">Do not include privileged or highly sensitive facts.</p>
          <label className="mt-3 block text-sm">Matter category
            <select name="specialty" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm">Short description
            <textarea name="description" required rows={3} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" placeholder="Non-confidential summary" />
          </label>
          <label className="mt-3 block text-sm">Jurisdiction
            <select name="jurisdiction" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" defaultValue={card.licenseJurisdictions[0]}>
              {card.licenseJurisdictions.map((code) => <option key={code} value={code}>{stateName(code)}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm">Requested slot
            <select name="slot" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">
              <option value="">Ask the attorney to propose a time</option>
              {slots.map((slot) => <option key={slot.id} value={slot.id}>{formatWhen(slot.startAtUtc, card.timezone)}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm">Duration
            <select name="duration" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2">
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">Contact preference
            <input name="contact" defaultValue="In-app demo messages" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <input type="hidden" name="budget" value="Not sure" />
          <input type="hidden" name="urgency" value="Flexible" />
          <button type="submit" data-testid="request-consultation" disabled={!card.bookable} className="mt-4 min-h-11 w-full rounded-full bg-pink font-display font-semibold text-white disabled:opacity-50">Submit consultation request</button>
        </form>
        <form id="quote" className="rounded-3xl bg-white p-4" onSubmit={onQuote}>
          <h2 className="font-display text-xl font-extrabold">Request a quote</h2>
          <label className="mt-3 block text-sm">What should the work accomplish?
            <textarea name="description" required rows={3} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <label className="mt-3 block text-sm">Deadline
            <input name="deadline" type="date" defaultValue="2026-12-15" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <label className="mt-3 block text-sm">Budget
            <input name="budget" defaultValue="Not sure" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-2" />
          </label>
          <button type="submit" disabled={!card.bookable} className="mt-4 min-h-11 w-full rounded-full bg-navy font-display font-semibold text-white disabled:opacity-50">Request Quote</button>
        </form>
        {error ? <p role="alert" className="text-sm text-pink">{error}</p> : null}
        {message ? <Notice>{message}</Notice> : null}
        <p className="text-xs text-ink"><Link href="/disclaimers/" className="underline">No legal advice and no attorney-client relationship</Link> from this page.</p>
      </aside>
    </div>
  );
}
