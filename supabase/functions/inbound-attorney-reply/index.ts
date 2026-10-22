import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders, emailAddress, json, replyAddress, sendRelay } from '../_shared/mail.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false }, 405);

  const secret = Deno.env.get('INBOUND_WEBHOOK_SECRET');
  if (!secret || request.headers.get('x-legalgrads-inbound-secret') !== secret) return json({ ok: false }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const data = (payload.data && typeof payload.data === 'object' ? payload.data : payload) as Record<string, unknown>;
  let from = String(data.from ?? '');
  let to = data.to;
  let text = String(data.text ?? '');
  const emailId = String(data.email_id ?? '');

  if (emailId && !text) {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ ok: false }, 500);
    const received = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    if (!received.ok) return json({ ok: false }, 502);
    const email = await received.json() as Record<string, unknown>;
    from = String(email.from ?? from);
    to = email.to ?? to;
    text = String(email.text ?? '');
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((item) => String(item));
  const messageId = recipients.map((item) => /reply\+([0-9a-f-]{36})@/i.exec(item)?.[1]).find(Boolean);
  if (!messageId || !text.trim()) return json({ ok: false }, 400);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ ok: false }, 500);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('attorney_message_replies')
    .select('id', { count: 'exact', head: true })
    .eq('message_id', messageId)
    .gt('created_at', since);
  if ((count ?? 0) >= 20) return json({ ok: false }, 429);

  const { data: message } = await supabase
    .from('attorney_messages')
    .select('id, sender_email, profile_id')
    .eq('id', messageId)
    .maybeSingle();
  if (!message) return json({ ok: false }, 404);

  const { data: profile } = await supabase
    .from('attorney_profiles')
    .select('application_id, full_name')
    .eq('id', message.profile_id)
    .maybeSingle();
  const { data: application } = await supabase
    .from('attorney_applications')
    .select('email')
    .eq('id', profile?.application_id ?? '')
    .maybeSingle();

  const attorneyEmail = String(application?.email ?? '').toLowerCase();
  const senderEmail = String(message.sender_email).toLowerCase();
  const fromEmail = emailAddress(from);
  let destination = '';
  let direction: 'to_attorney' | 'to_sender' | '' = '';
  if (fromEmail === attorneyEmail) {
    destination = senderEmail;
    direction = 'to_sender';
  } else if (fromEmail === senderEmail) {
    destination = attorneyEmail;
    direction = 'to_attorney';
  }
  if (!destination || !direction) return json({ ok: false }, 403);

  const replyTo = replyAddress(messageId);
  const sent = await sendRelay(
    destination,
    'Reply on Legalgrads',
    `A reply on the Legalgrads listing for ${profile?.full_name ?? 'an attorney'}:\n\n${text.trim()}\n\nNeither email address is added to this message.`,
    replyTo,
  );
  if (!sent) return json({ ok: false }, 502);
  await supabase.from('attorney_message_replies').insert({ message_id: messageId, direction });
  return json({ ok: true });
});
