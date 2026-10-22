import { validEmail } from '@/lib/format';

export interface AttorneyMessageInput {
  profileId?: string;
  name: string;
  email: string;
  phone: string;
  body: string;
  consent: boolean;
  honeypot: string;
}

const SENT = 'Message sent. The attorney receives it through Legalgrads. Your email is not shown.';
const STORED = 'Message saved. It will be relayed when email delivery is turned on. Your email is not shown.';
const LATER = 'Please wait and try again later.';
const FAILED = 'We could not send that message. Try again.';

export function messageProblems(input: AttorneyMessageInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!validEmail(input.email)) errors.email = 'Enter a valid email address.';
  if (input.phone.trim() && input.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a phone number with at least 10 digits, or leave it blank.';
  const body = input.body.trim();
  if (body.length < 10) errors.body = 'Write a short message, at least 10 characters.';
  else if (body.length > 2000) errors.body = 'Keep the message under 2,000 characters.';
  if (!input.consent) errors.consent = 'Agree before sending.';
  return errors;
}

export async function sendAttorneyMessage(input: AttorneyMessageInput): Promise<{ ok: boolean; message: string }> {
  if (input.honeypot.trim()) return { ok: true, message: SENT };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !input.profileId) return { ok: false, message: FAILED };
  const payload = {
    profile_id: input.profileId,
    sender_name: input.name.trim(),
    sender_email: input.email.trim(),
    sender_phone: input.phone.trim() || null,
    body: input.body.trim(),
    consent: true,
    company_website: '',
  };
  try {
    const response = await fetch(`${url}/functions/v1/relay-attorney-message`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: key,
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.status === 429) return { ok: false, message: LATER };
    if (response.ok) {
      const data = await response.json().catch(() => ({})) as { relayed?: boolean; stored?: boolean };
      return { ok: true, message: data.relayed ? SENT : STORED };
    }
    if (response.status === 404) return insertMessage(url, key, payload);
    return { ok: false, message: FAILED };
  } catch {
    return { ok: false, message: FAILED };
  }
}

async function insertMessage(url: string, key: string, payload: {
  profile_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  body: string;
}): Promise<{ ok: boolean; message: string }> {
  const response = await fetch(`${url}/rest/v1/attorney_messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: key,
      authorization: `Bearer ${key}`,
      prefer: 'return=minimal',
    },
    body: JSON.stringify({
      profile_id: payload.profile_id,
      sender_name: payload.sender_name,
      sender_email: payload.sender_email,
      sender_phone: payload.sender_phone,
      body: payload.body,
      consent_at: new Date().toISOString(),
      honeypot: '',
    }),
  });
  if (response.status === 429 || response.status === 400) {
    const text = await response.text();
    if (/rate limit/i.test(text)) return { ok: false, message: LATER };
  }
  if (response.ok) return { ok: true, message: STORED };
  return { ok: false, message: FAILED };
}
