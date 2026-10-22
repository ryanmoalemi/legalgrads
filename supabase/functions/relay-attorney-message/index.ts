import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders, json, replyAddress, sendRelay } from '../_shared/mail.ts';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  if (String(payload.company_website ?? '').trim()) return json({ ok: true, stored: false, relayed: false });

  const profileId = String(payload.profile_id ?? '');
  const senderName = String(payload.sender_name ?? '').trim();
  const senderEmail = String(payload.sender_email ?? '').trim();
  const senderPhone = payload.sender_phone == null ? '' : String(payload.sender_phone).trim();
  const body = String(payload.body ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) return json({ ok: false }, 400);
  if (senderName.length < 2 || senderName.length > 120) return json({ ok: false }, 400);
  if (!EMAIL.test(senderEmail) || senderEmail.length > 200) return json({ ok: false }, 400);
  if (senderPhone && (senderPhone.length < 7 || senderPhone.length > 40)) return json({ ok: false }, 400);
  if (body.length < 10 || body.length > 2000) return json({ ok: false }, 400);
  if (payload.consent !== true) return json({ ok: false }, 400);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ ok: false }, 500);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'unknown';
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: ipCount } = await supabase
    .from('message_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('bucket', `ip:${ip}`)
    .gt('created_at', since);
  if ((ipCount ?? 0) >= 10) return json({ ok: false }, 429);
  await supabase.from('message_rate_limits').insert({ bucket: `ip:${ip}` });

  const { data: profile, error: profileError } = await supabase
    .from('attorney_profiles')
    .select('id, application_id, published, full_name')
    .eq('id', profileId)
    .eq('published', true)
    .maybeSingle();
  if (profileError || !profile) return json({ ok: false }, 404);

  const { data: inserted, error: insertError } = await supabase
    .from('attorney_messages')
    .insert({
      profile_id: profileId,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: senderPhone || null,
      body,
      consent_at: new Date().toISOString(),
      honeypot: '',
    })
    .select('id')
    .single();
  if (insertError) {
    if (/rate limit/i.test(insertError.message)) return json({ ok: false }, 429);
    return json({ ok: false }, 400);
  }

  const { data: application } = await supabase
    .from('attorney_applications')
    .select('email')
    .eq('id', profile.application_id)
    .maybeSingle();
  const attorneyEmail = String(application?.email ?? '');
  if (!EMAIL.test(attorneyEmail)) {
    await supabase.from('attorney_messages').update({ relay_error: 'no attorney address' }).eq('id', inserted.id);
    return json({ ok: true, stored: true, relayed: false });
  }

  const replyTo = replyAddress(inserted.id);
  const text = [
    `Someone sent a message about the Legalgrads listing for ${profile.full_name}.`,
    '',
    `Name: ${senderName}`,
    senderPhone ? `Phone: ${senderPhone}` : '',
    '',
    body,
    '',
    'Legalgrads relayed this message. Your email address is not shown to the sender, and their email address is not in this message.',
    replyTo ? 'Reply to this email to respond through Legalgrads.' : 'Email delivery is one-way until reply routing is turned on.',
  ].filter(Boolean).join('\n');

  const relayed = await sendRelay(attorneyEmail, 'New message on Legalgrads', text, replyTo);
  await supabase
    .from('attorney_messages')
    .update(relayed ? { relayed_at: new Date().toISOString(), relay_error: null } : { relay_error: 'not relayed' })
    .eq('id', inserted.id);

  return json({ ok: true, stored: true, relayed });
});
