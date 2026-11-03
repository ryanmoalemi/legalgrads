import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders, json } from '../_shared/mail.ts';

const TEST = new Set(['ryan@legalgrads.com', 'aftermarketproducts71@gmail.com']);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PROFILE_PATH = /^\/attorneys\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/$/;
const DEFAULT_FROM = 'Legalgrads <hello@legalgrads.com>';
const FREE_MAIL = new Set(['gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'zoho.com', 'yandex.com', 'comcast.net', 'att.net', 'sbcglobal.net', 'verizon.net']);

type Contact = { bar_email: string | null; firm_domain: string | null; law_school_domain: string | null };
type Method = 'bar_email' | 'firm_domain' | 'law_school_email' | 'manual';

function emailDomain(email: string): string {
  return (email.split('@')[1] || '').toLowerCase();
}

function domainMatches(email: string, expected: string | null | undefined): boolean {
  const want = (expected || '').toLowerCase().replace(/^www\./, '');
  const domain = emailDomain(email);
  if (!want || FREE_MAIL.has(want) || FREE_MAIL.has(domain)) return false;
  return domain === want || domain.endsWith(`.${want}`);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '';
  return `${local[0]}***@${domain}`;
}

/**
 * Pluggable verification steps, strongest first. Each returns true when the claimant's email proves identity.
 * Future steps (not built yet): 'bar_phone_sms' using claim_contacts.has_bar_phone, and 'stripe_identity'
 * (ID + selfie) as a fallback before manual review. Add them here and the claim row records the method used.
 */
const VERIFIERS: { method: Exclude<Method, 'manual'>; check: (email: string, contact: Contact | null) => boolean }[] = [
  { method: 'bar_email', check: (email, c) => Boolean(c?.bar_email) && email === c!.bar_email!.toLowerCase() },
  { method: 'firm_domain', check: (email, c) => domainMatches(email, c?.firm_domain) },
  { method: 'law_school_email', check: (email, c) => /\.(edu|ca)$/.test(emailDomain(email)) && domainMatches(email, c?.law_school_domain) },
];

export function claimMethod(email: string, contact: Contact | null): Method {
  for (const step of VERIFIERS) if (step.check(email, contact)) return step.method;
  return 'manual';
}

let domainVerified: boolean | null = null;

function canMail(email: string): boolean {
  return Deno.env.get('CLAIM_MAIL_LIVE') === '1' || TEST.has(email);
}

function fromAddress(): string {
  const claimFrom = Deno.env.get('CLAIM_FROM')?.trim();
  const messageFrom = Deno.env.get('MESSAGE_FROM')?.trim();
  for (const candidate of [claimFrom, messageFrom, DEFAULT_FROM]) {
    if (candidate && /@legalgrads\.com\b/i.test(candidate)) return candidate;
  }
  return '';
}

function fromDomain(from: string): string {
  const match = /@([a-z0-9.-]+)/i.exec(from);
  return (match?.[1] || '').toLowerCase();
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashValue(email: string, profilePath: string, secret: string): Promise<string> {
  const salt = Deno.env.get('CLAIM_CODE_SALT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'legalgrads';
  return sha256(`${salt}:${email}:${profilePath}:${secret}`);
}


async function senderReady(): Promise<{ ok: boolean; reason: string; from: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = fromAddress();
  if (!apiKey) return { ok: false, reason: 'missing-api-key', from };
  if (!from) return { ok: false, reason: 'from-not-legalgrads', from };
  if (domainVerified === null) {
    const response = await fetch('https://api.resend.com/domains', {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    if (response.status === 401 || response.status === 403) {
      // Sending-only keys cannot list domains. Resend still rejects unverified senders at send time.
      domainVerified = true;
    } else if (!response.ok) {
      domainVerified = false;
    } else {
      const body = await response.json().catch(() => ({})) as { data?: { name?: string; status?: string }[] };
      const domain = fromDomain(from);
      domainVerified = Boolean(body.data?.some((row) => row.name?.toLowerCase() === domain && row.status === 'verified'));
    }
  }
  if (!domainVerified) return { ok: false, reason: 'domain-not-verified', from };
  return { ok: true, reason: '', from };
}

async function sendClaimMail(to: string, subject: string, text: string, from: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  return response.ok;
}

function codeMail(name: string, code: string, profilePath: string): { subject: string; text: string } {
  return {
    subject: 'Your Legalgrads confirmation code',
    text: [
      `Hello ${name},`,
      '',
      `Your Legalgrads confirmation code is ${code}.`,
      '',
      'Enter this code on the claim page to confirm this listing is yours.',
      'The code expires in 30 minutes.',
      '',
      `Listing: https://legalgrads.com${profilePath}`,
    ].join('\n'),
  };
}

function welcomeMail(name: string, profilePath: string, approved: boolean): { subject: string; text: string } {
  const editUrl = `https://legalgrads.com/attorney/profile/?profile=${encodeURIComponent(profilePath)}`;
  return {
    subject: 'Your Legalgrads profile is claimed',
    text: [
      `Hello ${name},`,
      '',
      'You claimed your free Legalgrads profile.',
      'You can add a photo, a short bio, services, contact info, and practice areas.',
      '',
      `Edit your profile: ${editUrl}`,
      '',
      'The confirmation code signs you in on this device.',
      ...(approved
        ? ['Your claim matched the official bar record, so your edits show on your public profile.']
        : ['Your claim is pending review because the email did not match the official bar record.', 'Your edits are saved but stay hidden from the public until we confirm the claim.']),
      'A later directory import keeps profiles that are marked claimed or owner-edited.',
    ].join('\n'),
  };
}

/** Bar numbers compare without case, hyphens, spaces, or leading zeros. The profile slug ends with the bar number. */
function normBar(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^0+/, '');
}

function barMatches(profilePath: string, typed: unknown): boolean {
  const slugBar = profilePath.replace(/\/$/, '').split('-').pop() || '';
  const entered = normBar(String(typed || ''));
  return entered.length > 0 && entered === normBar(slugBar);
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  return (forwarded.split(',')[0] || request.headers.get('cf-connecting-ip') || '').trim().slice(0, 64);
}

const PROOF_BUCKET = 'claim-proofs';
const PROOF_MAX = 5 * 1024 * 1024;

function decodeImage(dataUrl: unknown): { bytes: Uint8Array; type: string; ext: string } | null {
  const match = /^data:(image\/(jpeg|png|webp|heic));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!match) return null;
  const binary = atob(match[3]);
  if (binary.length > PROOF_MAX || binary.length < 1000) return null;
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return { bytes, type: match[1], ext: match[2] === 'jpeg' ? 'jpg' : match[2] };
}

function isServiceRole(request: Request): boolean {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const auth = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  return key.length > 20 && auth === key;
}

function client() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
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

  if (action === 'purge') {
    const db = client();
    if (!db) return json({ ok: false });
    const { data: queued } = await db.from('claim_proof_deletions').select('object_path').limit(200);
    const paths = (queued || []).map((row: { object_path: string }) => row.object_path);
    if (paths.length) {
      const removed = await db.storage.from(PROOF_BUCKET).remove(paths);
      if (!removed.error) await db.from('claim_proof_deletions').delete().in('object_path', paths);
    }
    return json({ ok: true, removed: paths.length });
  }

  if (action === 'review') {
    if (!isServiceRole(request)) return json({ ok: false }, 401);
    const db = client();
    if (!db) return json({ ok: false });
    const { data: rows, error } = await db.from('claim_review').select('*');
    if (error) return json({ ok: false, reason: 'storage-not-ready' });
    const out = [];
    for (const row of rows || []) {
      const sign = async (path: string | null) => {
        if (!path) return null;
        const { data } = await db.storage.from(PROOF_BUCKET).createSignedUrl(path, 600);
        return data?.signedUrl || null;
      };
      out.push({ ...row, proof_card_url: await sign(row.proof_card_path), proof_selfie_url: await sign(row.proof_selfie_path) });
    }
    return json({ ok: true, expiresInSeconds: 600, rows: out });
  }
  let email = String(payload.email || '').trim().toLowerCase();
  const profilePath = String(payload.profilePath || '');
  const name = String(payload.name || '').trim().slice(0, 160);
  if (!PROFILE_PATH.test(profilePath)) return json({ ok: false, reason: 'bad-profile' }, 400);
  const useBarEmail = payload.useBarEmail === true;

  async function contactFor(db: NonNullable<ReturnType<typeof client>>): Promise<Contact | null> {
    const { data } = await db.from('claim_contacts').select('bar_email, firm_domain, law_school_domain').eq('profile_path', profilePath).maybeSingle();
    return (data as Contact | null) || null;
  }

  if (action === 'options') {
    const db = client();
    if (!db) return json({ ok: false, reason: 'storage-not-ready' });
    const contact = await contactFor(db);
    const { data: claimRow } = await db.from('profile_owner_edits').select('approved, disputed').eq('profile_path', profilePath).maybeSingle();
    return json({
      ok: true,
      barEmailMasked: contact?.bar_email ? maskEmail(contact.bar_email.toLowerCase()) : '',
      firmDomain: contact?.firm_domain || '',
      lawSchoolDomain: contact?.law_school_domain || '',
      claimed: Boolean(claimRow),
    });
  }

  if (action === 'report') {
    const db = client();
    if (!db) return json({ ok: false, reason: 'storage-not-ready' });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await db.from('profile_claim_reports').select('id', { count: 'exact', head: true }).eq('profile_path', profilePath).gt('created_at', since);
    if ((count ?? 0) >= 5) return json({ ok: false, reason: 'rate-limit' }, 429);
    const { data: claimRow } = await db.from('profile_owner_edits').select('email').eq('profile_path', profilePath).maybeSingle();
    const reporter = String(payload.reporterEmail || '').trim().toLowerCase().slice(0, 200);
    await db.from('profile_claim_reports').insert({
      profile_path: profilePath,
      kind: 'wrong-claim',
      reporter_email: EMAIL.test(reporter) ? reporter : '',
      note: String(payload.note || '').slice(0, 1000),
      claimed_email: claimRow?.email || '',
    });
    if (claimRow) await db.from('profile_owner_edits').update({ disputed: true }).eq('profile_path', profilePath);
    return json({ ok: true });
  }

  if (action === 'public') {
    const supabase = client();
    if (!supabase) return json({ ok: false, reason: 'storage-not-ready' });
    const { data, error } = await supabase.from('profile_owner_edits').select('bio, services, phone, contact_link, practice_areas, photo_data_url, full_name, approved, disputed').eq('profile_path', profilePath).maybeSingle();
    if (error || !data) return json({ ok: true, edit: null, claimed: false });
    if (!data.approved || data.disputed) return json({ ok: true, edit: null, claimed: true, verified: false });
    return json({
      ok: true,
      claimed: true,
      verified: true,
      edit: {
        bio: data.bio || '',
        services: data.services || '',
        phone: data.phone || '',
        contactLink: data.contact_link || '',
        practiceAreas: data.practice_areas || [],
        photoDataUrl: data.photo_data_url || '',
        fullName: data.full_name || '',
      },
    });
  }

  if (useBarEmail && action !== 'public') {
    const db = client();
    const contact = db ? await contactFor(db) : null;
    if (!contact?.bar_email) return json({ ok: false, reason: 'no-bar-email' }, 400);
    email = contact.bar_email.trim().toLowerCase();
  }

  if (!EMAIL.test(email) || email.length > 200) return json({ ok: false, reason: 'bad-email' }, 400);
  if (!canMail(email) && action !== 'verify' && action !== 'save' && action !== 'proof') {
    return json({ ok: true, sent: false, reason: 'live-mail-off' });
  }

  const supabase = client();
  if (!supabase) return json({ ok: false, sent: false, reason: 'storage-not-ready' });

  if (action === 'send-code' || action === 'verify') {
    if (!barMatches(profilePath, payload.barNumber)) return json({ ok: false, sent: false, reason: 'bar-mismatch' }, 400);
    if (payload.attest !== true) return json({ ok: false, sent: false, reason: 'attest-required' }, 400);
  }

  if (action === 'send-code') {
    const ready = await senderReady();
    if (!ready.ok) return json({ ok: true, sent: false, reason: ready.reason, from: ready.from });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase.from('profile_claim_codes').select('id', { count: 'exact', head: true }).eq('email', email).gt('created_at', since);
    if ((count ?? 0) >= 5) return json({ ok: false, sent: false, reason: 'rate-limit' }, 429);
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    const code = String(100000 + (n % 900000));
    const codeHash = await hashValue(email, profilePath, code);
    const inserted = await supabase.from('profile_claim_codes').insert({
      profile_path: profilePath,
      email,
      code_hash: codeHash,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    if (inserted.error) return json({ ok: false, sent: false, reason: 'storage-not-ready' });
    const mail = codeMail(name || 'there', code, profilePath);
    const sent = await sendClaimMail(email, mail.subject, mail.text, ready.from);
    if (!sent) {
      await supabase.from('profile_claim_codes').delete().eq('email', email).eq('code_hash', codeHash);
      return json({ ok: false, sent: false, reason: 'send-failed', from: ready.from });
    }
    return json({ ok: true, sent: true, from: ready.from });
  }

  if (action === 'verify') {
    const code = String(payload.code || '');
    if (!/^\d{6}$/.test(code)) return json({ ok: false }, 400);
    const { data: rows, error } = await supabase.from('profile_claim_codes').select('id, code_hash, attempts, expires_at').eq('email', email).eq('profile_path', profilePath).is('used_at', null).order('created_at', { ascending: false }).limit(1);
    if (error) return json({ ok: false, reason: 'storage-not-ready' });
    const row = rows?.[0];
    if (!row || new Date(row.expires_at).getTime() < Date.now() || row.attempts >= 8) return json({ ok: false, reason: 'bad-code' });
    const codeHash = await hashValue(email, profilePath, code);
    if (codeHash !== row.code_hash) {
      await supabase.from('profile_claim_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return json({ ok: false, reason: 'bad-code' });
    }
    const contact = await contactFor(supabase);
    const method = claimMethod(email, contact);
    const approved = method !== 'manual';
    const { data: current } = await supabase.from('profile_owner_edits').select('email, approved, disputed').eq('profile_path', profilePath).maybeSingle();
    const takeover = Boolean(current && current.email !== email);
    if (takeover && !approved) {
      await supabase.from('profile_claim_reports').insert({ profile_path: profilePath, kind: 'competing-claim', reporter_email: email, claimed_email: current!.email });
      await supabase.from('profile_claim_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id);
      return json({ ok: false, reason: 'already-claimed' });
    }
    if (takeover) {
      await supabase.from('profile_claim_reports').insert({ profile_path: profilePath, kind: 'reclaimed', reporter_email: email, claimed_email: current!.email, resolved: true, note: `Reclaimed by ${method}` });
    }
    const tokenBytes = crypto.getRandomValues(new Uint8Array(16));
    const claimToken = Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const tokenHash = await hashValue(email, profilePath, claimToken);
    const saved = await supabase.from('profile_owner_edits').upsert({
      profile_path: profilePath,
      email,
      claim_token_hash: tokenHash,
      bar_number: String(payload.barNumber || '').trim().slice(0, 16),
      attested_at: new Date().toISOString(),
      attest_ip: clientIp(request),
      state_code: String(payload.stateCode || '').slice(0, 2),
      full_name: name,
      city: String(payload.city || '').slice(0, 120),
      method,
      approved,
      approved_at: approved ? new Date().toISOString() : null,
      disputed: false,
      ...(takeover ? { pending_bio: null, pending_services: null, edits_submitted_at: null, bio: '', services: '', phone: '', contact_link: '', practice_areas: [], photo_data_url: '' } : {}),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_path' });
    if (saved.error) return json({ ok: false, reason: 'storage-not-ready' });
    await supabase.from('profile_claim_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id);
    return json({ ok: true, claimToken, method, approved });
  }

  if (action === 'welcome') {
    if (!canMail(email)) return json({ ok: true, sent: false, reason: 'live-mail-off' });
    const ready = await senderReady();
    if (!ready.ok) return json({ ok: true, sent: false, reason: ready.reason, from: ready.from });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase.from('profile_claim_mail').select('id', { count: 'exact', head: true }).eq('email', email).eq('kind', 'welcome').gt('created_at', since);
    if ((count ?? 0) >= 3) return json({ ok: false, sent: false, reason: 'rate-limit' }, 429);
    const { data: claimRow } = await supabase.from('profile_owner_edits').select('email, approved').eq('profile_path', profilePath).maybeSingle();
    if (!claimRow || claimRow.email !== email) return json({ ok: false, sent: false, reason: 'not-claimed' });
    const mail = welcomeMail(name || 'there', profilePath, Boolean(claimRow.approved));
    const sent = await sendClaimMail(email, mail.subject, mail.text, ready.from);
    if (sent) await supabase.from('profile_claim_mail').insert({ email, kind: 'welcome' });
    return json({ ok: sent, sent, reason: sent ? '' : 'send-failed', from: ready.from });
  }

  if (action === 'save') {
    const token = String(payload.claimToken || '');
    if (!/^[a-f0-9]{32}$/.test(token)) return json({ ok: false }, 400);
    const edit = (payload.edit && typeof payload.edit === 'object') ? payload.edit as Record<string, unknown> : {};
    const photo = String(edit.photoDataUrl || '');
    if (photo && (!photo.startsWith('data:image/') || photo.length > 180000)) return json({ ok: false, reason: 'bad-photo' }, 400);
    const tokenHash = await hashValue(email, profilePath, token);
    const { data: existing, error } = await supabase.from('profile_owner_edits').select('claim_token_hash, bio, services, pending_bio, pending_services').eq('profile_path', profilePath).maybeSingle();
    if (error || !existing || existing.claim_token_hash !== tokenHash) return json({ ok: false, reason: 'bad-token' });
    const areas = Array.isArray(edit.practiceAreas) ? edit.practiceAreas.map((item) => String(item).slice(0, 40)).slice(0, 12) : [];
    // Free text (bio, services) waits for review. Structured fields save directly.
    const bio = String(edit.bio || '').slice(0, 600);
    const services = String(edit.services || '').slice(0, 600);
    const pendingBio = bio === (existing.bio || '') ? null : bio;
    const pendingServices = services === (existing.services || '') ? null : services;
    const textPending = pendingBio !== null || pendingServices !== null;
    const updated = await supabase.from('profile_owner_edits').update({
      pending_bio: pendingBio,
      pending_services: pendingServices,
      edits_submitted_at: textPending ? new Date().toISOString() : null,
      phone: String(edit.phone || '').slice(0, 40),
      contact_link: String(edit.contactLink || '').slice(0, 300),
      practice_areas: areas,
      photo_data_url: photo,
      updated_at: new Date().toISOString(),
    }).eq('profile_path', profilePath);
    if (updated.error) return json({ ok: false, reason: 'storage-not-ready' });
    return json({ ok: true, textPending });
  }

  if (action === 'proof') {
    const token = String(payload.claimToken || '');
    if (!/^[a-f0-9]{32}$/.test(token)) return json({ ok: false }, 400);
    const tokenHash = await hashValue(email, profilePath, token);
    const { data: existing } = await supabase.from('profile_owner_edits').select('claim_token_hash, approved, proof_card_path, proof_selfie_path').eq('profile_path', profilePath).maybeSingle();
    if (!existing || existing.claim_token_hash !== tokenHash) return json({ ok: false, reason: 'bad-token' });
    if (existing.approved) return json({ ok: false, reason: 'already-approved' });
    const card = decodeImage(payload.cardImage);
    const selfie = decodeImage(payload.selfieImage);
    if (!card || !selfie) return json({ ok: false, reason: 'bad-image' }, 400);
    const folder = profilePath.replace(/^\/|\/$/g, '').replace(/\//g, '_');
    const stamp = Date.now();
    const cardPath = `${folder}/${stamp}-card.${card.ext}`;
    const selfiePath = `${folder}/${stamp}-selfie.${selfie.ext}`;
    const a = await supabase.storage.from(PROOF_BUCKET).upload(cardPath, card.bytes, { contentType: card.type });
    const b = await supabase.storage.from(PROOF_BUCKET).upload(selfiePath, selfie.bytes, { contentType: selfie.type });
    if (a.error || b.error) {
      await supabase.storage.from(PROOF_BUCKET).remove([cardPath, selfiePath]);
      return json({ ok: false, reason: 'upload-failed' });
    }
    const old = [existing.proof_card_path, existing.proof_selfie_path].filter(Boolean) as string[];
    if (old.length) await supabase.storage.from(PROOF_BUCKET).remove(old);
    await supabase.from('profile_owner_edits').update({ proof_card_path: cardPath, proof_selfie_path: selfiePath, proof_uploaded_at: new Date().toISOString() }).eq('profile_path', profilePath);
    return json({ ok: true });
  }

  return json({ ok: false }, 400);
});
