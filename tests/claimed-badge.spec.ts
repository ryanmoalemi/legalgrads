import { expect, test, type Page, type Route } from '@playwright/test';
import { claimedBadgeCopy } from '../src/lib/claimed-badge';
import { boot, noOverflow } from './helpers';

const ANTHONY = '/attorneys/ca/san-bernardino/anthony-glen-jones-ii-368290/';
const NEVADA = '/attorneys/nv/las-vegas/mercedes-mariah-martinez-15845/';
const OHIO = '/attorneys/oh/st-louis-mo/christine-frames-cushman-0087535/';
const DEMO_CLAIMED = '/attorneys/ca/san-diego/jordan-example-demo-claimed/';
const DEMO_UNCLAIMED = '/attorneys/ca/san-diego/jordan-example-demo-unclaimed/';
const DASH = /\u2014|\u2013/;

test('badge copy uses the profile record and drops missing pieces', () => {
  expect(claimedBadgeCopy({
    barValue: 'CA Bar #368290',
    barLabel: 'California Bar Number',
    status: 'Active',
    stateName: 'California',
    authority: 'State Bar of California',
  })).toEqual({
    head: 'Bar #368290 · Active',
    match: 'matched to State Bar record',
    disclosure: 'This attorney claimed and manages this profile on LegalGrads. The listing shows CA Bar #368290 with Active status, matched to the official State Bar of California record.',
  });

  expect(claimedBadgeCopy({
    barValue: '#15845',
    barLabel: 'License number',
    status: 'ATTORNEY Active',
    stateName: 'Nevada',
    authority: 'State Bar of Nevada',
  })).toEqual({
    head: 'License #15845 · ATTORNEY Active',
    match: 'matched to State Bar of Nevada record',
    disclosure: 'This attorney claimed and manages this profile on LegalGrads. The listing shows License #15845 with ATTORNEY Active status, matched to the official State Bar of Nevada record.',
  });

  expect(claimedBadgeCopy({
    barValue: '#0087535',
    barLabel: 'License number',
    status: 'Active',
    stateName: 'Ohio',
    authority: 'Supreme Court of Ohio',
  }).match).toBe('matched to Supreme Court of Ohio record');

  expect(claimedBadgeCopy({
    barValue: 'WY Bar #8-6661',
    barLabel: 'Wyoming Bar Number',
    status: '',
    stateName: 'Wyoming',
    authority: 'State Bar of California',
  }).head).toBe('Bar #8-6661');

  const missingBar = claimedBadgeCopy({
    barValue: '',
    barLabel: '',
    status: 'Active',
    stateName: 'Texas',
    authority: '',
  });
  expect(missingBar.head).toBe('Active');
  expect(missingBar.match).toBe('matched to Texas state bar record');
  expect(missingBar.disclosure).toBe('This attorney claimed and manages this profile on LegalGrads. The listing shows Active status, matched to the official Texas state bar record.');
  expect(missingBar.disclosure).not.toMatch(/ · |,\s*,|with\s+status/);

  const unknown = claimedBadgeCopy({ barValue: '', barLabel: '', status: '', stateName: '', authority: '' });
  expect(unknown.head).toBe('');
  expect(unknown.match).toBe('matched to official state bar record');
  expect(unknown.disclosure).toBe('This attorney claimed and manages this profile on LegalGrads. The listing is matched to the official state bar record.');
  expect(JSON.stringify([missingBar, unknown])).not.toMatch(DASH);
});

async function mockVerified(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { LEGALGRADS_SUPABASE: unknown }).LEGALGRADS_SUPABASE = { url: 'https://mock-project.supabase.test', key: 'sb_publishable_test' };
  });
  await page.route('https://mock-project.supabase.test/**', async (route: Route) => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ ok: true, claimed: true, verified: true, edit: { bio: 'Claimed profile bio for the badge check.' } }),
    });
  });
}

async function openHelp(page: Page) {
  await page.locator('.lg-claimed__help summary').click();
  await expect(page.getByTestId('claimed-help')).toBeVisible();
}

test('demo claimed profile renders the badge and an unclaimed profile does not', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await boot(page, DEMO_CLAIMED);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jordan Example');
  await expect(page.getByTestId('claimed-badge')).toContainText('Claimed by attorney');
  await expect(page.locator('.lg-claimed__icon')).toBeVisible();
  await expect(page.getByTestId('claimed-subline')).toHaveText('Bar #000000 · Active · matched to State Bar record');
  await expect(page.locator('.chip.solid')).toHaveCount(0);
  await expect(page.locator('.lg-header a.lg-btn')).toHaveText('Claim your free profile');
  await openHelp(page);
  await expect(page.getByTestId('claimed-help')).toHaveText('This attorney claimed and manages this profile on LegalGrads. The listing shows CA Bar #000000 with Active status, matched to the official State Bar of California record.');
  await expect(page.getByTestId('claimed-help')).not.toContainText(DASH);
  await noOverflow(page);

  await boot(page, DEMO_UNCLAIMED);
  await expect(page.locator('.chip.solid')).toHaveText('Profile not yet claimed');
  await expect(page.locator('.lg-claimed')).toHaveCount(0);
  await expect(page.locator('.lg-header a.lg-btn')).toHaveText('Claim your free profile');
});

test('static claimed profiles build the badge from the page record', async ({ page }) => {
  await mockVerified(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await boot(page, ANTHONY);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anthony Glen Jones II');
  await expect(page.getByTestId('claimed-subline')).toHaveText('Bar #368290 · Active · matched to State Bar record');
  await expect(page.locator('.chip.solid')).toBeHidden();
  await expect(page.locator('.barline')).toContainText('CA Bar #368290');
  await expect(page.locator('.lg-header a.lg-btn')).toHaveText('Claim your free profile');
  await openHelp(page);
  await expect(page.getByTestId('claimed-help')).toHaveText('This attorney claimed and manages this profile on LegalGrads. The listing shows CA Bar #368290 with Active status, matched to the official State Bar of California record.');
  const nameBox = await page.locator('.lg-claimed-title h1').boundingBox();
  const pillBox = await page.getByTestId('claimed-badge').boundingBox();
  expect(pillBox!.x).toBeGreaterThan(nameBox!.x + nameBox!.width - 2);
  expect(Math.abs((pillBox!.y + pillBox!.height / 2) - (nameBox!.y + nameBox!.height / 2))).toBeLessThan(20);
  await noOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId('claimed-badge')).toBeVisible();
  const mobileName = await page.locator('.lg-claimed-title h1').boundingBox();
  const mobilePill = await page.getByTestId('claimed-badge').boundingBox();
  expect(mobilePill!.y).toBeGreaterThan(mobileName!.y + mobileName!.height - 2);
  await openHelp(page);
  await noOverflow(page);

  await boot(page, NEVADA);
  await expect(page.getByTestId('claimed-subline')).toHaveText('License #15845 · ATTORNEY Active · matched to State Bar of Nevada record');
  await openHelp(page);
  await expect(page.getByTestId('claimed-help')).toContainText('License #15845 with ATTORNEY Active status, matched to the official State Bar of Nevada record.');
  await expect(page.getByTestId('claimed-help')).not.toContainText('California');

  await boot(page, OHIO);
  await expect(page.getByTestId('claimed-subline')).toHaveText('License #0087535 · Active · matched to Supreme Court of Ohio record');
  await openHelp(page);
  await expect(page.getByTestId('claimed-help')).toContainText('matched to the official Supreme Court of Ohio record.');
  await expect(page.getByTestId('claimed-help')).not.toContainText(DASH);
});

test('an unclaimed static profile keeps the outline chip', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await boot(page, ANTHONY);
  await expect(page.locator('.chip.solid')).toHaveText('Profile not yet claimed');
  await expect(page.locator('.lg-claimed')).toHaveCount(0);
  await expect(page.locator('.who h1')).toHaveText('Anthony Glen Jones II');
  await expect(page.locator('.lg-header a.lg-btn')).toHaveText('Claim your free profile');
  await expect(page.locator('.barline')).toContainText('CA Bar #368290');
});
