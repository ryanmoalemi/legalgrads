import { expect, test } from '@playwright/test';
import { CLASSIFIER_URL, classifyInquiry, parseScreenLabel, precheckSpam, relaySubject } from '../supabase/functions/_shared/screen';

test('prechecks hold pitches and leave client inquiries alone', () => {
  expect(precheckSpam('Ana Ruiz', 'I was injured in a car accident last week and need advice about insurance.')).toBeNull();
  expect(precheckSpam('Ana Ruiz', 'I was scammed by a crypto company and need a lawyer to help me recover the money.')).toBeNull();
  expect(precheckSpam('Growth Co', 'We offer SEO services and a guest post placement on your site.')).toBe('keywords');
  const links = ['https://a.example/1', 'https://b.example/2', 'https://c.example/3', 'https://d.example/4'].join(' ');
  expect(precheckSpam('Ana Ruiz', `Please look at these pages ${links}`)).toBe('links');
  expect(precheckSpam('Ana Ruiz', 'One link only: https://example.com/lease')).toBeNull();
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
