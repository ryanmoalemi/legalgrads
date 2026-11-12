import { expect, test, type Page, type Route } from '@playwright/test';
import { boot, noOverflow } from './helpers';

const CALLIE = '/attorneys/ca/escondido/callie-yahyavi-369241/';
const MOCK = 'https://mock-project.supabase.test';
const NOTICE = 'Send a brief description only. Do not include confidential details or documents. Sending a request does not by itself hire a lawyer. The lawyer must confirm availability, check for conflicts, and agree to represent you.';

type Calls = { name: string; body: Record<string, unknown> }[];

async function mockSupabase(page: Page, handler: (name: string, body: Record<string, unknown>) => unknown): Promise<Calls> {
  const calls: Calls = [];
  await page.addInitScript((url) => {
    (window as unknown as { LEGALGRADS_SUPABASE: unknown }).LEGALGRADS_SUPABASE = { url, key: 'sb_publishable_test' };
  }, MOCK);
  await page.route(`${MOCK}/**`, async (route: Route) => {
    const url = new URL(route.request().url());
    const name = url.pathname.split('/').pop() || '';
    const body = JSON.parse(route.request().postData() || '{}');
    calls.push({ name, body });
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    const result = handler(name, body) ?? { ok: false };
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(result) });
  });
  return calls;
}

const CLAIM = {
  profilePath: CALLIE,
  email: 'aftermarketproducts71@gmail.com',
  name: 'Callie Yahyavi',
  barNumber: '369241',
  stateCode: 'CA',
  city: 'Escondido',
  claimedAt: '2026-11-11T09:00:00.000Z',
  claimToken: 'a'.repeat(32),
  photoDataUrl: '',
  bio: '',
  services: '',
  phone: '',
  contactLink: '',
  practiceAreas: [],
  approved: true,
};

async function tap(page: Page, testId: string) {
  await page.getByTestId(testId).locator('xpath=..').click();
  await expect(page.getByTestId(testId)).toBeChecked();
}

async function seedClaim(page: Page, claim: Record<string, unknown> = CLAIM) {
  await page.addInitScript((value) => {
    if (!localStorage.getItem('legalgrads-owner-claims')) localStorage.setItem('legalgrads-owner-claims', JSON.stringify({ [value.profilePath as string]: value }));
  }, claim);
}

test('claim flow: code to the bar email, resend, then straight into the editor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let sends = 0;
  const calls = await mockSupabase(page, (name, body) => {
    if (name !== 'claim-notify') return { ok: true, claimed: false };
    if (body.action === 'options') return { ok: true, barEmailMasked: 'c***@example.com', firmDomain: '', lawSchoolDomain: '', claimed: false };
    if (body.action === 'send-code') {
      sends += 1;
      return sends > 2 ? { ok: false, sent: false, reason: 'rate-limit' } : { ok: true, sent: true };
    }
    if (body.action === 'verify') return body.code === '123456' ? { ok: true, claimToken: 'b'.repeat(32), approved: true, method: 'bar_email' } : { ok: false, reason: 'bad-code' };
    if (body.action === 'welcome') return { ok: true, sent: true };
    return { ok: false };
  });
  await boot(page, `/claim/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make this profile yours.');
  await expect(page.getByTestId('claim-bar-email')).toContainText('We will send a confirmation code to the email address in your official licensing record');
  await page.getByTestId('claim-attest').check({ force: true });
  await page.getByRole('button', { name: 'Email my confirmation code' }).click();
  await expect(page.getByTestId('claim-status')).toContainText('We emailed a confirmation code');
  const sent = calls.find((call) => call.body.action === 'send-code');
  expect(sent?.body.useBarEmail).toBe(true);
  expect(sent?.body.barNumber).toBe('369241');
  await expect(page.getByTestId('claim-resend')).toBeDisabled();
  await page.getByTestId('claim-code-input').fill('000000');
  await page.getByRole('button', { name: 'Confirm and sign in' }).click();
  await expect(page.getByTestId('claim-error')).toContainText('send a new code');
  await noOverflow(page);
  await page.getByTestId('claim-code-input').fill('123456');
  await page.getByRole('button', { name: 'Confirm and sign in' }).click();
  await expect(page).toHaveURL(/\/attorney\/profile\/\?profile=.*welcome=1/);
  await expect(page.getByTestId('owner-welcome')).toBeVisible();
  await expect(page.getByTestId('owner-progress')).toHaveText('Profile 0% complete');
});

test('claim flow explains a rate limit clearly', async ({ page }) => {
  await mockSupabase(page, (name, body) => {
    if (body.action === 'options') return { ok: true, barEmailMasked: '', firmDomain: '', lawSchoolDomain: '', claimed: false };
    if (body.action === 'send-code') return { ok: false, sent: false, reason: 'rate-limit' };
    return { ok: false };
  });
  await boot(page, `/claim/?profile=${encodeURIComponent(CALLIE)}`);
  await page.getByTestId('claim-attest').check({ force: true });
  await page.getByTestId('claim-email').fill('someone@example.com');
  await page.getByRole('button', { name: 'Email my confirmation code' }).click();
  await expect(page.getByTestId('claim-error')).toContainText('Too many codes');
});

test('editor: checklists, consultations, fees, availability, progress, and live preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedClaim(page);
  await boot(page, `/attorney/profile/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('owner-progress')).toHaveText('Profile 0% complete');
  await page.getByTestId('owner-bio').fill('I help Escondido business owners with contracts, formation, and the paperwork that keeps a company running.');
  await tap(page, 'owner-service-1');
  await tap(page, 'owner-service-2');
  await tap(page, 'owner-client-1');
  await tap(page, 'owner-consult-video');
  await tap(page, 'owner-consult-free');
  await tap(page, 'owner-billing-fixed');
  await page.getByTestId('owner-fee-add').click();
  await page.getByTestId('owner-fee-service-0').fill('LLC formation');
  await page.getByTestId('owner-fee-price-0').fill('$900');
  await tap(page, 'owner-availability-accepting');
  await expect(page.getByTestId('owner-availability-date')).toContainText('2026');
  await page.getByTestId('owner-phone').fill('4155551212');
  await page.getByTestId('owner-link').fill('https://example.com');
  await tap(page, 'owner-pref-inquiry');
  await expect(page.getByTestId('owner-progress')).toHaveText('Profile 89% complete');
  const preview = page.getByTestId('owner-preview');
  await expect(preview).toContainText('Contract review');
  await expect(preview).toContainText('Free · Video');
  await expect(preview).toContainText('LLC formation: $900');
  await expect(preview).toContainText('Taking new clients');
  await noOverflow(page);
  await expect(page.getByTestId('owner-status')).toContainText('Saved on this device', { timeout: 10_000 });
  await page.getByTestId('owner-save').click();
  await expect(page.getByTestId('owner-status')).toContainText('Saved on this device');
  await page.goto(CALLIE);
  const edit = page.locator('#owner-edit');
  await expect(edit).toContainText('Contract review');
  await expect(edit).toContainText('Works with: Startups');
  await expect(page.getByTestId('owner-fixed-fees')).toContainText('LLC formation: $900');
  await expect(page.locator('#fees-state span').last()).toHaveText('Fixed fee');
  await expect(page.locator('#fact-consult')).toContainText('Free');
  await expect(page.locator('#fact-availability')).toContainText('Taking new clients (updated');
  await expect(page.locator('.chip.solid')).toHaveText('Claimed on this device');
});

test('pending claims submit for review', async ({ page }) => {
  await seedClaim(page, { ...CLAIM, approved: false });
  await boot(page, `/attorney/profile/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('owner-save')).toHaveText('Submit profile for review');
  await expect(page.getByTestId('proof-form')).toBeVisible();
});

test('verified claimed profile shows the request form with the notice, honeypot, and delivery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const calls = await mockSupabase(page, (name, body) => {
    if (name === 'owner-tools' && body.action === 'public') {
      return { ok: true, claimed: true, verified: true, edit: { bio: 'Business lawyer in Escondido.', serviceList: ['Contract review'], billing: ['hourly'], phone: '(415) 555-1212', contactLink: 'https://example.com', contactPref: 'inquiry', inquiriesEnabled: true, availability: 'accepting', availabilityUpdatedAt: '2026-11-10T18:00:00.000Z' } };
    }
    if (name === 'owner-tools' && body.action === 'inquiry') return { ok: true, delivered: true };
    if (name === 'record_profile_event') return {};
    return { ok: false };
  });
  await boot(page, CALLIE);
  await expect(page.locator('.chip.solid')).toHaveText('Claimed profile');
  await expect(page.locator('#about-claim')).toHaveText('The attorney has claimed this profile on LegalGrads.');
  await expect(page.locator('.card.claim')).toBeHidden();
  await expect(page.locator('#example-profile')).toBeHidden();
  await expect(page.locator('#claim-benefits')).toBeHidden();
  const card = page.locator('#inquiry');
  await expect(card.getByRole('heading', { name: 'Ask about your legal needs' })).toBeVisible();
  await expect(page.getByTestId('inquiry-notice')).toHaveText(NOTICE);
  await expect(page.getByTestId('inquiry-recipient')).toContainText('emailed to Callie Yahyavi');
  const noticeBox = await page.getByTestId('inquiry-notice').boundingBox();
  const formBox = await page.getByTestId('inquiry-form').boundingBox();
  expect(noticeBox!.y).toBeLessThan(formBox!.y);
  await expect(page.locator('#inquiry .trap')).toHaveAttribute('aria-hidden', 'true');
  const trapBox = await page.locator('#inquiry input[name="website"]').boundingBox();
  expect(trapBox!.x).toBeLessThan(0);
  await expect(page.locator('#inquiry input[name="website"]')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#fees-state span').last()).toHaveText('Hourly');
  await card.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByTestId('inquiry-status')).toContainText('Add your name');
  await card.locator('input[name="name"]').fill('Pat Owner');
  await card.locator('input[name="email"]').fill('aftermarketproducts71@gmail.com');
  await card.locator('textarea[name="message"]').fill('I run a small bakery and need a supplier contract reviewed.');
  await card.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByTestId('inquiry-sent')).toContainText('Callie will reply by email');
  const sent = calls.find((call) => call.body.action === 'inquiry')!;
  expect(sent.body.website).toBe('');
  expect(Number(sent.body.startedAt)).toBeGreaterThan(0);
  expect(sent.body.profilePath).toBe(CALLIE);
  expect(calls.some((call) => call.name === 'record_profile_event')).toBe(false);
  await noOverflow(page);
});

test('request form errors from the server are shown', async ({ page }) => {
  await mockSupabase(page, (name, body) => {
    if (body.action === 'public') return { ok: true, claimed: true, verified: true, edit: { inquiriesEnabled: true } };
    if (body.action === 'inquiry') return { ok: false, reason: 'rate-limit', message: 'Too many requests from here. Try again later.' };
    return { ok: false };
  });
  await boot(page, CALLIE);
  const card = page.locator('#inquiry');
  await card.locator('input[name="name"]').fill('Pat Owner');
  await card.locator('input[name="email"]').fill('pat@example.com');
  await card.locator('textarea[name="message"]').fill('Need help with a commercial lease for my shop.');
  await card.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByTestId('inquiry-status')).toHaveText('Too many requests from here. Try again later.');
});

test('unverified or unclaimed profiles never show the request form', async ({ page }) => {
  await mockSupabase(page, (_name, body) => (body.action === 'public' ? { ok: true, claimed: true, verified: false, edit: null } : { ok: false }));
  await boot(page, CALLIE);
  await expect(page.locator('.chip.solid')).toHaveText('Claim pending review');
  await expect(page.locator('#inquiry')).toHaveCount(0);
});

test('private dashboard shows honest zeros with definitions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedClaim(page);
  const calls = await mockSupabase(page, (_name, body) => (body.action === 'dashboard' ? { ok: true, since: '2026-10-12', views: 0, websiteClicks: 0, phoneClicks: 0, inquiries: 0, approved: true } : { ok: false }));
  await boot(page, `/attorney/dashboard/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profile stats');
  for (const key of ['views', 'websiteClicks', 'phoneClicks', 'inquiries']) await expect(page.getByTestId(`dashboard-${key}`)).toHaveText('0');
  await expect(page.getByTestId('dashboard-zero')).toBeVisible();
  await expect(page.getByText('Counting since Nov 11, 2026')).toBeVisible();
  await expect(page.locator('dl')).toContainText('Known bots, crawlers, and link previews are not counted');
  const call = calls.find((item) => item.body.action === 'dashboard')!;
  expect(call.body.claimToken).toBe(CLAIM.claimToken);
  await noOverflow(page);
});

test('dashboard shows real counts and an expired sign-in message', async ({ page }) => {
  await seedClaim(page);
  let first = true;
  await mockSupabase(page, (_name, body) => {
    if (body.action !== 'dashboard') return { ok: false };
    if (first) {
      first = false;
      return { ok: true, since: '2026-11-11', views: 42, websiteClicks: 3, phoneClicks: 2, inquiries: 1 };
    }
    return { ok: false, reason: 'bad-token' };
  });
  await boot(page, `/attorney/dashboard/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('dashboard-views')).toHaveText('42');
  await expect(page.getByTestId('dashboard-inquiries')).toHaveText('1');
  await page.reload();
  await expect(page.getByTestId('dashboard-unavailable')).toContainText('sign-in on this device has expired');
});

test('dashboard without a claim asks the attorney to verify first', async ({ page }) => {
  await boot(page, `/attorney/dashboard/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verify this profile first');
});

test('no public view counter, promise page, and sitemap entry', async ({ page, request }) => {
  const html = await (await request.get(CALLIE)).text();
  expect(html).not.toMatch(/viewed this profile|people viewed/i);
  const demo = await (await request.get('/attorneys/ca/san-diego/jordan-example-demo-claimed/')).text();
  expect(demo).not.toMatch(/viewed this profile|Founding Member/i);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await boot(page, '/free-listing-promise/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your listing is free. Always.');
    await expect(page.getByTestId('promise-claim')).toHaveText('Claim my free profile');
    await expect(page.getByTestId('promise-claim')).toHaveAttribute('href', /^\/claim\/$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Optional: sponsored upgrade for more visibility' })).toBeVisible();
    await expect(page.locator('main')).toContainText('Sponsored placements will be clearly labeled as sponsored advertisements.');
    await expect(page.locator('main')).not.toContainText('What might cost money');
    await expect(page.locator('main')).not.toContainText(/\u2014|\u2013/);
    await noOverflow(page);
  }
  await boot(page, `/free-listing-promise/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('promise-claim')).toHaveAttribute('href', `/claim/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('promise-claim-bottom')).toHaveAttribute('href', `/claim/?profile=${encodeURIComponent(CALLIE)}`);
  const index = await (await request.get('/sitemap.xml')).text();
  const parts = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  let found = false;
  for (const part of parts) {
    const xml = await (await request.get(part)).text();
    if (xml.includes('https://legalgrads.com/free-listing-promise/')) found = true;
  }
  expect(found).toBe(true);
  await boot(page, '/attorney-terms/');
  await expect(page.locator('main')).toContainText('Optional sponsored placements may be offered in the future.');
  await expect(page.locator('main')).toContainText('Paid placements will be clearly labeled as sponsored advertisements.');
  await expect(page.locator('main a[href="/free-listing-promise/"]').first()).toBeVisible();
});
