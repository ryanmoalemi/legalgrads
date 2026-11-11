import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders, json } from '../_shared/mail.ts';
import { precheckSpam } from '../_shared/screen.ts';
import { LINK_ERROR } from '../_shared/links.ts';

/**
 * Owner tools for claimed profiles: save the full editor, read the public profile,
 * private stats for the owner, and inquiries emailed to the verified attorney.
 * Sign-in is the claim token issued by claim-notify after the email code.
 */

const PROFILE_PATH = /^\/attorneys\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TEST = new Set(['ryan@legalgrads.com', 'aftermarketproducts71@gmail.com']);
const DEFAULT_FROM = 'LegalGrads <ryan@legalgrads.com>';
const LISTS: Record<string, Set<string>> = {
  consult_modes: new Set(['phone', 'video', 'in-person']),
  billing: new Set(['hourly', 'fixed', 'quoted']),
};

function client() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Same token hash as claim-notify, so a claim token from that function signs in here. */
async function tokenHash(email: string, profilePath: string, secret: string): Promise<string> {
  const salt = Deno.env.get('CLAIM_CODE_SALT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'legalgrads';
  return sha256(`${salt}:${email}:${profilePath}:${secret}`);
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  return (forwarded.split(',')[0] || request.headers.get('cf-connecting-ip') || '').trim().slice(0, 64);
}

function cleanList(value: unknown, max: number, len: number, allowed?: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const text = String(item || '').replace(/\s+/g, ' ').trim().slice(0, len);
    if (!text || out.includes(text)) continue;
    if (allowed && !allowed.has(text)) continue;
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

function cleanFees(value: unknown): { service: string; price: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => ({ service: String(row?.service || '').trim().slice(0, 80), price: String(row?.price || '').trim().slice(0, 40) }))
    .filter((row) => row.service && row.price)
    .slice(0, 6);
}

function canDeliver(to: string): boolean {
  return Deno.env.get('INQUIRY_MAIL_LIVE') === '1' || TEST.has(to) || /@resend\.dev$/.test(to);
}

async function owner(db: NonNullable<ReturnType<typeof client>>, payload: Record<string, unknown>, profilePath: string) {
  let email = String(payload.email || '').trim().toLowerCase();
  if (payload.useBarEmail === true) {
    const { data } = await db.from('claim_contacts').select('bar_email').eq('profile_path', profilePath).maybeSingle();
    email = String(data?.bar_email || '').trim().toLowerCase();
  }
  const token = String(payload.claimToken || '');
  if (!EMAIL.test(email) || !/^[a-f0-9]{32}$/.test(token)) return null;
  const { data } = await db.from('profile_owner_edits').select('*').eq('profile_path', profilePath).maybeSingle();
  if (!data || data.claim_token_hash !== await tokenHash(email, profilePath, token)) return null;
  return data as Record<string, unknown>;
}

function publicEdit(row: Record<string, unknown>) {
  return {
    bio: row.bio || '',
    services: row.services || '',
    serviceList: row.service_list || [],
    clientTypes: row.client_types || [],
    consultModes: row.consult_modes || [],
    consultFee: row.consult_fee || '',
    consultPrice: row.consult_price || '',
    billing: row.billing || [],
    fixedFees: row.fixed_fees || [],
    availability: row.availability || '',
    availabilityUpdatedAt: row.availability_updated_at || '',
    contactPref: row.contact_pref || '',
    phone: row.phone || '',
    contactLink: row.contact_link || '',
    practiceAreas: row.practice_areas || [],
    photoDataUrl: row.photo_data_url || '',
    fullName: row.full_name || '',
    inquiriesEnabled: row.inquiries_enabled !== false,
  };
}

async function sendMail(payload: Record<string, unknown>, key: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'idempotency-key': key },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false }, 405);
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const action = String(payload.action || '');
  const profilePath = String(payload.profilePath || '');
  if (!PROFILE_PATH.test(profilePath)) return json({ ok: false, reason: 'bad-profile' }, 400);
  const db = client();
  if (!db) return json({ ok: false, reason: 'storage-not-ready' });

  if (action === 'public') {
    const { data } = await db.from('profile_owner_edits').select('*').eq('profile_path', profilePath).maybeSingle();
    if (!data) return json({ ok: true, claimed: false, edit: null });
    if (!data.approved || data.disputed) return json({ ok: true, claimed: true, verified: false, edit: null });
    const edit = publicEdit(data);
    // Hide the form until delivery to this attorney is switched on, so visitors never fill in a dead form.
    edit.inquiriesEnabled = edit.inquiriesEnabled && canDeliver(String(data.email || '').toLowerCase());
    return json({ ok: true, claimed: true, verified: true, edit });
  }

  if (action === 'save') {
    const row = await owner(db, payload, profilePath);
    if (!row) return json({ ok: false, reason: 'bad-token' }, 401);
    const edit = (payload.edit && typeof payload.edit === 'object') ? payload.edit as Record<string, unknown> : {};
    const photo = String(edit.photoDataUrl || '');
    if (photo && (!photo.startsWith('data:image/') || photo.length > 180000)) return json({ ok: false, reason: 'bad-photo' }, 400);
    const link = String(edit.contactLink || '').trim().slice(0, 300);
    if (link && !/^https:\/\/\S+$/.test(link)) return json({ ok: false, reason: 'bad-link' }, 400);
    // Free text (bio, custom services) waits for a person to review it. Structured fields save directly.
    const bio = String(edit.bio || '').slice(0, 600);
    const services = String(edit.services || '').slice(0, 600);
    const pendingBio = bio === (row.bio || '') ? null : bio;
    const pendingServices = services === (row.services || '') ? null : services;
    const textPending = pendingBio !== null || pendingServices !== null;
    const availability = ['accepting', 'limited', 'not'].includes(String(edit.availability)) ? String(edit.availability) : '';
    const availabilityChanged = availability !== (row.availability || '');
    const consultFee = ['free', 'paid'].includes(String(edit.consultFee)) ? String(edit.consultFee) : '';
    const contactPref = ['phone', 'website', 'inquiry'].includes(String(edit.contactPref)) ? String(edit.contactPref) : '';
    const now = new Date().toISOString();
    const update = {
      pending_bio: pendingBio,
      pending_services: pendingServices,
      edits_submitted_at: textPending ? now : null,
      phone: String(edit.phone || '').slice(0, 40),
      contact_link: link,
      practice_areas: cleanList(edit.practiceAreas, 12, 40),
      photo_data_url: photo,
      service_list: cleanList(edit.serviceList, 16, 60),
      client_types: cleanList(edit.clientTypes, 10, 60),
      consult_modes: cleanList(edit.consultModes, 3, 20, LISTS.consult_modes),
      consult_fee: consultFee,
      consult_price: consultFee === 'paid' ? String(edit.consultPrice || '').trim().slice(0, 40) : '',
      billing: cleanList(edit.billing, 3, 20, LISTS.billing),
      fixed_fees: cleanFees(edit.fixedFees),
      availability,
      availability_updated_at: availabilityChanged ? (availability ? now : null) : row.availability_updated_at,
      contact_pref: contactPref,
      inquiries_enabled: edit.inquiriesEnabled !== false,
      updated_at: now,
    };
    const saved = await db.from('profile_owner_edits').update(update).eq('profile_path', profilePath);
    if (saved.error) return json({ ok: false, reason: 'storage-not-ready' });
    return json({ ok: true, textPending, approved: Boolean(row.approved), availabilityUpdatedAt: update.availability_updated_at || '' });
  }

  if (action === 'dashboard') {
    const row = await owner(db, payload, profilePath);
    if (!row) return json({ ok: false, reason: 'bad-token' }, 401);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sinceDay = since.toISOString().slice(0, 10);
    const count = async (kind: string) => {
      const { count: n } = await db.from('profile_events').select('visitor_hash', { count: 'exact', head: true }).eq('profile_path', profilePath).eq('kind', kind).gte('day', sinceDay);
      return n ?? 0;
    };
    const { count: inquiries } = await db.from('profile_inquiries').select('id', { count: 'exact', head: true }).eq('profile_path', profilePath).eq('status', 'delivered').gte('created_at', since.toISOString());
    return json({
      ok: true,
      since: sinceDay,
      views: await count('view'),
      websiteClicks: await count('website_click'),
      phoneClicks: await count('phone_click'),
      inquiries: inquiries ?? 0,
      approved: Boolean(row.approved),
    });
  }

  if (action === 'inquiry') {
    const name = String(payload.name || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const sender = String(payload.email || '').trim().toLowerCase().slice(0, 200);
    const phone = String(payload.phone || '').trim().slice(0, 40);
    const business = String(payload.business || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const message = String(payload.message || '').trim();
    if (!name) return json({ ok: false, reason: 'name', message: 'Enter your name.' }, 400);
    if (!EMAIL.test(sender)) return json({ ok: false, reason: 'email', message: 'Enter a valid email address so the attorney can reply.' }, 400);
    if (message.length < 20) return json({ ok: false, reason: 'short', message: 'Describe what you need in a sentence or two.' }, 400);
    if (message.length > 1000) return json({ ok: false, reason: 'long', message: 'Keep the description under 1,000 characters.' }, 400);
    const salt = Deno.env.get('CLAIM_CODE_SALT') || 'legalgrads';
    const day = new Date().toISOString().slice(0, 10);
    const ipHash = await sha256(`${salt}:ip:${clientIp(request)}:${day}`);
    const senderHash = await sha256(`${salt}:sender:${sender}`);
    await db.from('profile_inquiries').delete().lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    const record = (status: string, reason = '') => db.from('profile_inquiries').insert({ profile_path: profilePath, ip_hash: ipHash, sender_hash: senderHash, status, reason, delivered_at: status === 'delivered' ? new Date().toISOString() : null });
    const started = Number(payload.startedAt || 0);
    const tooFast = !started || Date.now() - started < 3000;
    if (String(payload.website || '').trim() || tooFast) {
      await record('blocked', 'honeypot');
      return json({ ok: true, delivered: true });
    }
    const hour = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: ipHour } = await db.from('profile_inquiries').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gt('created_at', hour);
    const { count: senderDay } = await db.from('profile_inquiries').select('id', { count: 'exact', head: true }).eq('sender_hash', senderHash).gt('created_at', dayAgo);
    const { count: profileDay } = await db.from('profile_inquiries').select('id', { count: 'exact', head: true }).eq('profile_path', profilePath).gt('created_at', dayAgo);
    if ((ipHour ?? 0) >= 5 || (senderDay ?? 0) >= 5 || (profileDay ?? 0) >= 30) {
      return json({ ok: false, reason: 'rate-limit', message: 'Too many requests from here. Try again later.' }, 429);
    }
    const spam = precheckSpam(name, `${business}\n${message}`, phone);
    if (spam === 'links') return json({ ok: false, reason: 'links', message: `${LINK_ERROR}.` }, 400);
    if (spam === 'keywords') {
      await record('blocked', 'keywords');
      return json({ ok: true, delivered: true });
    }
    const { data: row } = await db.from('profile_owner_edits').select('email, approved, disputed, inquiries_enabled, full_name').eq('profile_path', profilePath).maybeSingle();
    if (!row || !row.approved || row.disputed || row.inquiries_enabled === false) {
      return json({ ok: false, reason: 'not-accepting', message: 'This attorney is not taking requests through LegalGrads.' }, 400);
    }
    const to = String(row.email || '').toLowerCase();
    if (!canDeliver(to)) {
      await record('held', 'mail-not-live');
      return json({ ok: false, reason: 'not-live', message: 'Requests through LegalGrads are not switched on yet. Use the phone number or website on this profile.' });
    }
    const from = Deno.env.get('INQUIRY_FROM')?.trim() || DEFAULT_FROM;
    const text = [
      `Hello ${row.full_name || 'there'},`,
      '',
      `${name} sent a request from your LegalGrads profile (https://legalgrads.com${profilePath}).`,
      '',
      `Name: ${name}`,
      `Email: ${sender}`,
      ...(phone ? [`Phone: ${phone}`] : []),
      ...(business ? [`Business: ${business}`] : []),
      '',
      'Their description:',
      message,
      '',
      'Reply to this email to answer them directly. LegalGrads does not keep a copy of this message.',
      'The sender was told that sending a request does not hire a lawyer, and that you must confirm availability, check for conflicts, and agree to represent them.',
      '',
      'LegalGrads',
    ].join('\n');
    const sent = await sendMail({ from, to: [to], reply_to: sender, subject: `New request from ${name} via LegalGrads`, text }, `inq-${senderHash.slice(0, 16)}-${Date.now()}`);
    await record(sent ? 'delivered' : 'failed', sent ? '' : 'send-failed');
    if (!sent) return json({ ok: false, reason: 'send-failed', message: 'We could not deliver your request. Try again in a few minutes.' });
    return json({ ok: true, delivered: true });
  }

  return json({ ok: false }, 400);
});
