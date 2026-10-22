import { expect, test } from '@playwright/test';
import { buildRelayText, containsDisallowedLink, LINK_ERROR, withoutAutoLinks } from '../supabase/functions/_shared/links';
import { relayMailPayload } from '../supabase/functions/_shared/mail';
import { phoneProblem } from '../src/lib/applications';
import { messageProblems } from '../src/lib/messages';
import { CLASSIFIER_URL, classifyInquiry, parseScreenLabel, precheckSpam, relaySubject } from '../supabase/functions/_shared/screen';

test('attorney sign-up phone is a required 10-digit US number', () => {
  expect(phoneProblem('')).toBeTruthy();
  expect(phoneProblem('555-1212')).toBeTruthy();
  expect(phoneProblem('4155551212')).toBeNull();
  expect(phoneProblem('(415) 555-1212')).toBeNull();
  expect(phoneProblem('+1 415 555 1212')).toBeNull();
  expect(phoneProblem('011 44 20 7946 0958')).toBeTruthy();
});

test('prechecks hold pitches and leave client inquiries alone', () => {
  expect(precheckSpam('Ana Ruiz', 'I was injured in a car accident last week and need advice about insurance.')).toBeNull();
  expect(precheckSpam('Ana Ruiz', 'I was scammed by a crypto company and need a lawyer to help me recover the money.')).toBeNull();
  expect(precheckSpam('Growth Co', 'We offer SEO services and a guest post placement on your site.')).toBe('keywords');
  const links = ['https://a.example/1', 'https://b.example/2', 'https://c.example/3', 'https://d.example/4'].join(' ');
  expect(precheckSpam('Ana Ruiz', `Please look at these pages ${links}`)).toBe('links');
  expect(precheckSpam('Ana Ruiz', 'One link only: https://example.com/lease')).toBe('links');
  expect(precheckSpam('Ana Ruiz', 'I need help with a lease dispute in Oakland.', 'bit.ly/offer')).toBe('links');
});

test('client messages reject every kind of link and keep ordinary sentences', () => {
  const blocked = [
    'Please look at https://example.com/offer before we talk.',
    'The details are on http://example.com/case.',
    'See www.example.com for the papers.',
    'My question is about example.com and the lease.',
    'Use hxxp://example.com/spam if you can.',
    'Or hxxps://example.com/spam instead.',
    'Visit example dot com for the pitch.',
    'Visit example[.]com for the pitch.',
    'Visit example (dot) com for the pitch.',
    'Visit example . com for the pitch.',
    'Read [this page](https://example.com/offer) please.',
    'Read <a href="https://example.com/offer">this page</a> please.',
    'Short link: bit.ly/abc123 for the offer.',
    'Short link: tinyurl.com/abcd for the offer.',
    'Short link: t.co/abc123 for the offer.',
    'Short link: goo.gl/abc123 for the offer.',
    'Short link: ow.ly/abc123 for the offer.',
  ];
  const base = {
    name: 'Casey Client',
    email: 'casey.client@example.com',
    phone: '4155551212',
    consent: true,
    honeypot: '',
  };
  for (const body of blocked) {
    expect(containsDisallowedLink(body), body).toBe(true);
    expect(messageProblems({ ...base, body }).body, body).toBe(LINK_ERROR);
  }
  expect(messageProblems({ ...base, name: 'https://seo.example', body: 'I need help with a lease dispute in Oakland.' }).name).toBe(LINK_ERROR);

  const allowed = [
    'I was rear-ended on U.S. 101 at 3.30 p.m. near Dr. Shah.',
    'The medical bill is about $1,200.50 and Mr. Alvarez saw it happen.',
    'I need help with a lease dispute in Oakland, not a website.',
    'Cal. Civ. Code is confusing, but I can explain what the landlord did.',
  ];
  for (const body of allowed) {
    expect(containsDisallowedLink(body), body).toBe(false);
    expect(messageProblems({ ...base, body }).body, body).toBeUndefined();
  }
});

test('forwarded mail is plain text and a leftover link is not sent', () => {
  const clean = buildRelayText({
    attorney: 'Alex Rivera',
    sender: 'Casey Client',
    phone: '4155551212',
    body: 'I need help with a lease dispute in Oakland.',
    canReply: true,
  });
  expect(containsDisallowedLink(clean)).toBe(false);
  const payload = relayMailPayload('Legalgrads <messages@legalgrads.com>', 'alex@example.com', 'New message on Legalgrads', clean, null);
  expect(payload).not.toBeNull();
  expect(payload).not.toHaveProperty('html');
  expect(payload?.text).toBe(clean);

  const linked = buildRelayText({
    attorney: 'Alex Rivera',
    sender: 'Casey Client',
    phone: '',
    body: 'See https://example.com/offer',
    canReply: false,
  });
  expect(relayMailPayload('Legalgrads <messages@legalgrads.com>', 'alex@example.com', 'New message on Legalgrads', linked, null)).toBeNull();
  expect(containsDisallowedLink(withoutAutoLinks('Example.com Law'))).toBe(false);
});

test('subject flags and unreadable classifier output fail open', () => {
  expect(relaySubject('genuine')).toBe('New message on Legalgrads');
  expect(relaySubject('uncertain')).toBe('[Uncertain] New message on Legalgrads');
  expect(relaySubject('not_screened')).toBe('[Not screened] New message on Legalgrads');
  expect(parseScreenLabel('{"label":"spam"}')).toBe('spam');
  expect(parseScreenLabel('the message says spam but this is not json')).toBe('not_screened');
});

test('the classifier is the only request and errors are not screened', async () => {
  let called = '';
  const genuine = await classifyInquiry(
    { name: 'Ana Ruiz', body: 'I need help with a lease dispute in Oakland.' },
    'test-key',
    async (url, init) => {
      called = String(url);
      const sent = JSON.parse(String(init?.body)) as { contents: Array<{ parts: Array<{ text: string }> }> };
      expect(sent.contents[0].parts[0].text).toContain('lease dispute');
      expect(sent.contents[0].parts[0].text).not.toContain('@');
      expect(String(url)).not.toContain('test-key');
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: '{"label":"genuine"}' }] } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  );
  expect(called).toBe(CLASSIFIER_URL);
  expect(genuine).toBe('genuine');

  const failed = await classifyInquiry(
    { name: 'Ana Ruiz', body: 'I need help with a lease dispute in Oakland.' },
    'test-key',
    async () => new Response('no', { status: 500 }),
  );
  expect(failed).toBe('not_screened');
});
