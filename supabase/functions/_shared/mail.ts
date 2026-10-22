export const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-legalgrads-inbound-secret',
  'access-control-allow-methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

export function emailAddress(value: string): string {
  const wrapped = /<([^>]+)>/.exec(value);
  return (wrapped?.[1] ?? value).trim().toLowerCase();
}

export function replyAddress(messageId: string): string | null {
  const domain = Deno.env.get('INBOUND_EMAIL_DOMAIN')?.trim();
  if (!domain) return null;
  return `reply+${messageId}@${domain}`;
}

/** Sends plain text through Resend. Returns false when the provider key is not set. */
export async function sendRelay(to: string, subject: string, text: string, replyTo: string | null): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MESSAGE_FROM');
  if (!apiKey || !from) return false;
  const payload: Record<string, unknown> = { from, to: [to], subject, text };
  if (replyTo) payload.reply_to = replyTo;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.ok;
}
