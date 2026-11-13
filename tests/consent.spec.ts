import { expect, test } from '@playwright/test';
import {
  CONSENT_REGION_CODES,
  consentDefaultScript,
  countryNeedsAnalyticsConsent,
  needsAnalyticsConsent,
  timezoneNeedsAnalyticsConsent,
} from '../src/lib/consent-region';

test('consent region helpers cover EEA, UK and Switzerland', () => {
  expect(CONSENT_REGION_CODES).toEqual(
    expect.arrayContaining(['AT', 'DE', 'FR', 'IE', 'IT', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH']),
  );
  expect(countryNeedsAnalyticsConsent('de')).toBe(true);
  expect(countryNeedsAnalyticsConsent('US')).toBe(false);
  expect(countryNeedsAnalyticsConsent(null)).toBe(false);
  expect(timezoneNeedsAnalyticsConsent('Europe/Berlin')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('Europe/London')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('Atlantic/Reykjavik')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('Atlantic/Canary')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('Atlantic/Madeira')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('Atlantic/Faroe')).toBe(true);
  expect(timezoneNeedsAnalyticsConsent('America/Los_Angeles')).toBe(false);
  expect(timezoneNeedsAnalyticsConsent('UTC')).toBe(false);
  expect(needsAnalyticsConsent('US', 'Europe/Berlin')).toBe(false);
  expect(needsAnalyticsConsent(null, 'Europe/Berlin')).toBe(true);
  expect(needsAnalyticsConsent(null, 'America/New_York')).toBe(false);
});

test('consent mode script grants analytics globally and denies it in consent regions', () => {
  const script = consentDefaultScript();
  expect(script).toContain("analytics_storage:'granted'");
  expect(script).toContain("ad_storage:'denied'");
  expect(script).toContain("ad_user_data:'denied'");
  expect(script).toContain("ad_personalization:'denied'");
  expect(script).toContain('wait_for_update:500');
  expect(script).toContain('"GB"');
  expect(script).toContain('"CH"');
  expect(script).toContain('"NO"');
  expect(script).toMatch(/analytics_storage:'denied'[\s\S]*region:/);
  expect(script).toContain("localStorage.getItem('legalgrads-consent')");
});

test.describe('US timezone visitors', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });

  test('do not see the cookie banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
    const script = await page.locator('head script').evaluateAll((nodes) => nodes.map((node) => node.textContent || '').join('\n'));
    expect(script).toContain('wait_for_update:500');
    expect(script).toContain("analytics_storage:'granted'");
  });
});

test.describe('EU timezone visitors', () => {
  test.use({ timezoneId: 'Europe/Berlin' });

  test('see a banner and can accept analytics only', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('role', 'dialog');
    await expect(page.getByTestId('cookie-accept')).toBeVisible();
    await expect(page.getByTestId('cookie-reject')).toBeVisible();
    await expect(page.getByTestId('cookie-customize')).toHaveAttribute('href', '/cookie-settings/');
    await page.getByTestId('cookie-accept').click();
    await expect(banner).toHaveCount(0);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('legalgrads-consent') || 'null'));
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(false);
    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  });

  test('can reject analytics from the banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    await page.getByTestId('cookie-reject').click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('legalgrads-consent') || 'null'));
    expect(stored.analytics).toBe(false);
    expect(stored.marketing).toBe(false);
    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  });
});

test('privacy and cookie pages describe regional analytics defaults', async ({ page }) => {
  await page.goto('/privacy/');
  const privacy = await page.locator('main').innerText();
  expect(privacy).toContain('analytics is on by default');
  expect(privacy).toContain('European Union');
  expect(privacy).toContain('United Kingdom');
  expect(privacy).toContain('Switzerland');
  expect(privacy).not.toMatch(/Until you accept analytics, it runs in a cookieless mode/);
  await page.goto('/cookies/');
  const cookies = await page.locator('main').innerText();
  expect(cookies).toContain('analytics is on by default');
  expect(cookies).toContain('Cookie settings');
  await page.goto('/cookie-settings/');
  await expect(page.locator('main')).toContainText('Analytics is on by default outside the European Union');
});
