import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders, json } from '../_shared/mail.ts';

const TEST = new Set(['ryan@legalgrads.com', 'aftermarketproducts71@gmail.com']);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PROFILE_PATH = /^\/attorneys\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/$/;
const DEFAULT_FROM = 'Legalgrads <hello@legalgrads.com>';

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

let domainVerified: boolean | null = null;

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

function welcomeMail(name: string, profilePath: string): { subject: string; text: string } {
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
      'Your edits show on the public page in this browser and stay in your editor.',
      'A later directory import keeps profiles that are marked claimed or owner-edited.',
    ].join('\n'),
  };
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
  const email = String(payload.email || '').trim().toLowerCase();
  const profilePath = String(payload.profilePath || '');
  const name = String(payload.name || '').trim().slice(0, 160);
  if (!PROFILE_PATH.test(profilePath)) return json({ ok: false, reason: 'bad-profile' }, 400);

  if (action === 'public') {
    const supabase = client();
    if (!supabase) return json({ ok: false, reason: 'storage-not-ready' });
    const { data, error } = await supabase.from('profile_owner_edits').select('bio, services, phone, contact_link, practice_areas, photo_data_url, full_name').eq('profile_path', profilePath).maybeSingle();
    if (error || !data) return json({ ok: true, edit: null });
    return json({
      ok: true,
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

  if (!EMAIL.test(email) || email.length > 200) return json({ ok: false, reason: 'bad-email' }, 400);
  if (!canMail(email) && action !== 'verify' && action !== 'save') {
    return json({ ok: true, sent: false, reason: 'live-mail-off' });
  }

  const supabase = client();
  if (!supabase) return json({ ok: false, sent: false, reason: 'storage-not-ready' });

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
    const tokenBytes = crypto.getRandomValues(new Uint8Array(16));
    const claimToken = Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    const tokenHash = await hashValue(email, profilePath, claimToken);
    const saved = await supabase.from('profile_owner_edits').upsert({
      profile_path: profilePath,
      email,
      claim_token_hash: tokenHash,
      bar_number: String(payload.barNumber || '').slice(0, 16),
      state_code: String(payload.stateCode || '').slice(0, 2),
      full_name: name,
      city: String(payload.city || '').slice(0, 120),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_path' });
    if (saved.error) return json({ ok: false, reason: 'storage-not-ready' });
    await supabase.from('profile_claim_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id);
    return json({ ok: true, claimToken });
  }

  if (action === 'welcome') {
    if (!canMail(email)) return json({ ok: true, sent: false, reason: 'live-mail-off' });
    const ready = await senderReady();
    if (!ready.ok) return json({ ok: true, sent: false, reason: ready.reason, from: ready.from });
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase.from('profile_claim_mail').select('id', { count: 'exact', head: true }).eq('email', email).eq('kind', 'welcome').gt('created_at', since);
    if ((count ?? 0) >= 3) return json({ ok: false, sent: false, reason: 'rate-limit' }, 429);
    const mail = welcomeMail(name || 'there', profilePath);
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
    const { data: existing, error } = await supabase.from('profile_owner_edits').select('claim_token_hash').eq('profile_path', profilePath).maybeSingle();
    if (error || !existing || existing.claim_token_hash !== tokenHash) return json({ ok: false, reason: 'bad-token' });
    const areas = Array.isArray(edit.practiceAreas) ? edit.practiceAreas.map((item) => String(item).slice(0, 40)).slice(0, 12) : [];
    const updated = await supabase.from('profile_owner_edits').update({
      bio: String(edit.bio || '').slice(0, 600),
      services: String(edit.services || '').slice(0, 600),
      phone: String(edit.phone || '').slice(0, 40),
      contact_link: String(edit.contactLink || '').slice(0, 300),
      practice_areas: areas,
      photo_data_url: photo,
      updated_at: new Date().toISOString(),
    }).eq('profile_path', profilePath);
    if (updated.error) return json({ ok: false, reason: 'storage-not-ready' });
    return json({ ok: true });
  }

  return json({ ok: false }, 400);
});
