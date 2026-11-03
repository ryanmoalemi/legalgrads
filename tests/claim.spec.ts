import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { CLAIM_FROM, claimHref, normalizeProfilePath, removalHref, verificationEmail, welcomeEmail } from '../src/lib/claim';
import { boot } from './helpers';

const CALLIE = '/attorneys/ca/escondido/callie-yahyavi-369241/';
const SAMPLES = [
  CALLIE,
  '/attorneys/ak/office-unlisted/seth-howell-2502003/',
  '/attorneys/ar/mountain-home/william-samuel-berry-2024001/',
  '/attorneys/co/coeur-d-alene-id/leander-laurel-james-iv-60250/',
  '/attorneys/ct/providence-ri/daniel-calabro-jr-429032/',
  '/attorneys/de/office-unlisted/lauren-p-hartnett-007294/',
  '/attorneys/fl/miami/lauren-m-amos-1057656/',
  '/attorneys/hi/office-unlisted/jessica-la-londe-011855/',
  '/attorneys/id/hayden/braden-allen-agueros-11800/',
  '/attorneys/ks/independence-mo/brittany-kay-ussery-30022/',
  '/attorneys/md/office-unlisted/brianne-marie-bennett-2408191003/',
  '/attorneys/me/gardiner/samuel-wood-edgar-anderson-010792/',
  '/attorneys/mn/golden-valley/john-henry-stebbins-0504820/',
  '/attorneys/mo/st-louis/serena-hekmat-qamhieh-76010/',
  '/attorneys/nc/charlotte/krishna-rajivkumar-patel-61544/',
  '/attorneys/nd/bismarck/dixie-rae-holland-09670/',
  '/attorneys/nv/las-vegas/mercedes-mariah-martinez-15845/',
  '/attorneys/ny/san-francisco-ca/amanda-michele-pardee-4924791/',
  '/attorneys/oh/st-louis-mo/christine-frames-cushman-0087535/',
  '/attorneys/or/office-unlisted/isabelle-j-askanas-240078/',
  '/attorneys/pa/york/adam-edward-inch-337375/',
  '/attorneys/tx/office-unlisted/alexandra-claire-leissner-24127967/',
  '/attorneys/ut/office-unlisted/sharee-o-moser-10425/',
  '/attorneys/va/washington-dc/nereida-guadalupe-lopez-favela-100001/',
  '/attorneys/vt/office-unlisted/alexa-blaise-petterson-6571/',
  '/attorneys/wa/redmond/ashok-kumar-63685/',
  '/attorneys/wy/office-unlisted/ryan-facinelli-86661/',
  '/attorneys/ca/san-diego/jordan-example-demo-unclaimed/',
];

test('claim mail copy is plain and names the edit link', async () => {
  const editUrl = 'https://legalgrads.com/attorney/profile/?profile=%2Fattorneys%2Fca%2Fescondido%2Fcallie-yahyavi-369241%2F';
  const welcome = welcomeEmail({ name: 'Callie Yahyavi', editUrl });
  const code = verificationEmail({ name: 'Callie Yahyavi', code: '123456', profilePath: CALLIE });
  expect(welcome.from).toBe(CLAIM_FROM);
  expect(welcome.from).toContain('hello@legalgrads.com');
  expect(welcome.text).toContain(editUrl);
  expect(welcome.text).toContain('Edit your profile:');
  expect(code.text).toContain('123456');
  expect(code.text).not.toContain('physical letter');
  expect(`${welcome.subject}\n${welcome.text}\n${code.subject}\n${code.text}`).not.toMatch(/\u2014|\u2013/);
  expect(claimHref(CALLIE)).toBe(`/claim/?profile=${encodeURIComponent(CALLIE)}`);
  expect(removalHref(CALLIE)).toBe(`/data-deletion/?profile=${encodeURIComponent(CALLIE)}`);
  expect(normalizeProfilePath('https://evil.example/attorneys/ca/escondido/callie-yahyavi-369241/')).toBeNull();
  const source = await readFile('supabase/functions/claim-notify/index.ts', 'utf8');
  expect(source).toContain('Your Legalgrads profile is claimed');
  expect(source).toContain('hello@legalgrads.com');
  expect(source).toContain("CLAIM_MAIL_LIVE");
  expect(source).not.toMatch(/\u2014|\u2013/);
});

test('both claim buttons and removal links resolve for every sample state', async ({ request }) => {
  for (const path of SAMPLES) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const claimHits = [`/claim/?profile=${encodeURIComponent(path)}`, `/claim/?profile=${path}`]
      .map((href) => html.split(href).length - 1);
    const removalHits = [`/data-deletion/?profile=${encodeURIComponent(path)}`, `/data-deletion/?profile=${path}`]
      .some((href) => html.includes(href));
    expect(Math.max(...claimHits), path).toBeGreaterThanOrEqual(2);
    expect(removalHits, path).toBe(true);
    expect(html, path).toContain('/js/owner-edits.js');
    expect(html, path).toContain('We email you a confirmation code.');
    expect(html, path).not.toContain('mailed to your State Bar');
    expect(html, path).not.toMatch(/\u2014|\u2013/);
  }
});

test('unknown profile claim page is a real page', async ({ page }) => {
  await boot(page, '/claim/?profile=%2Fattorneys%2Fca%2Fescondido%2Fnot-a-real-person%2F');
  await expect(page.getByText('That listing is not in the directory.')).toBeVisible();
});

test('a non-test email does not reveal a code', async ({ page }) => {
  await boot(page, `/claim/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByTestId('claim-listing')).toContainText('Callie Yahyavi');
  await page.getByTestId('claim-email').fill('someone@example.com');
  await page.getByRole('button', { name: 'Email me a code' }).click();
  await expect(page.getByTestId('claim-error')).toBeVisible();
  await expect(page.getByTestId('claim-code')).toHaveCount(0);
  await expect(page.getByTestId('claim-error')).not.toContainText(/\d{6}/);
});

test('wyoming claim page keeps the official hyphenated bar number', async ({ page }) => {
  await boot(page, `/claim/?profile=${encodeURIComponent('/attorneys/wy/office-unlisted/ryan-facinelli-86661/')}`);
  await expect(page.getByTestId('claim-listing')).toContainText('Ryan Facinelli');
  await expect(page.getByTestId('claim-listing')).toContainText('Bar 8-6661');
});

test('test inbox can claim, edit, and see the edit on the public page', async ({ page }) => {
  await boot(page, CALLIE);
  await page.getByRole('link', { name: 'Claim my free profile' }).click();
  await expect(page).toHaveURL(/\/claim\/\?profile=/);
  await expect(page.getByTestId('claim-listing')).toContainText('Callie Yahyavi');
  await expect(page.getByTestId('claim-listing')).toContainText('Bar 369241');
  await page.goBack();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Claim this free profile' }).click();
  await expect(page.getByTestId('claim-listing')).toContainText('Callie Yahyavi');
  await page.getByTestId('claim-email').fill('ryan@legalgrads.com');
  await page.getByRole('button', { name: 'Email me a code' }).click();
  const code = (await page.getByTestId('claim-code').innerText()).replace(/\D/g, '');
  expect(code).toMatch(/^\d{6}$/);
  await page.getByTestId('claim-code-input').fill('000000');
  await page.getByRole('button', { name: 'Confirm and sign in' }).click();
  await expect(page.getByTestId('claim-error')).toContainText('does not match');
  await page.getByTestId('claim-code-input').fill(code);
  await page.getByRole('button', { name: 'Confirm and sign in' }).click();
  const welcome = page.getByTestId('welcome-email');
  await expect(welcome).toContainText('From: Legalgrads <hello@legalgrads.com>');
  await expect(welcome).toContainText('Edit your profile:');
  await expect(welcome).not.toContainText(/\u2014|\u2013/);
  await page.getByTestId('claim-edit-link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit your profile');
  await expect(page.getByText('Signed in on this device as ryan@legalgrads.com')).toBeVisible();
  const bio = 'I help Escondido clients with contracts and everyday business questions.';
  await page.getByTestId('owner-bio').fill(bio);
  await page.getByTestId('owner-services').fill('Contract review and formation paperwork.');
  await page.getByTestId('owner-phone').fill('4155551212');
  await page.getByTestId('owner-link').fill('https://example.com');
  await page.getByTestId('owner-area-contracts').check();
  await page.getByTestId('owner-photo').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  });
  await expect(page.locator('img[alt=""]')).toBeVisible();
  await page.getByTestId('owner-save').click();
  await expect(page.getByTestId('owner-status')).toContainText('Saved on this device');
  await page.reload();
  await expect(page.getByTestId('owner-bio')).toHaveValue(bio);
  await page.goto(CALLIE);
  await expect(page.locator('#owner-edit')).toContainText(bio);
  await expect(page.locator('#owner-edit')).toContainText('Contract review');
  await expect(page.locator('#owner-edit')).toContainText('Contracts');
  await expect(page.locator('.chip.solid')).toHaveText('Claimed on this device');
  await page.getByRole('link', { name: 'Request removal' }).click();
  await expect(page).toHaveURL(/\/data-deletion\/\?profile=/);
  await expect(page.getByTestId('removal-profile')).toContainText(CALLIE);
  await expect(page.locator('textarea[name="details"]')).toHaveValue(new RegExp(CALLIE.replace(/\//g, '\\/')));
  await page.locator('input[name="email"]').fill('ryan@legalgrads.com');
  await page.getByRole('button', { name: 'Prepare email' }).click();
  const mailto = page.getByTestId('prepared-mailto');
  await expect(mailto).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  await expect(mailto).toHaveAttribute('href', /callie-yahyavi-369241/);
});

test('editor without a verified claim asks for the code', async ({ page }) => {
  await boot(page, '/attorney/profile/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not public yet');
  await page.goto(`/attorney/profile/?profile=${encodeURIComponent(CALLIE)}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verify this profile first');
});
