import { expect, type Page } from '@playwright/test';

export async function boot(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem(
      'legalgrads-consent',
      JSON.stringify({ necessary: true, analytics: false, marketing: false, updatedAt: '2026-10-21T00:00:00.000Z' }),
    );
  });
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
}

export async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
