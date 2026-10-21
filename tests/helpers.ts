import { expect, type Page } from '@playwright/test';

export async function boot(page: Page, path = '/') {
  await page.addInitScript(() => {
    localStorage.setItem(
      'legalgrads-consent',
      JSON.stringify({ necessary: true, analytics: false, marketing: false, updatedAt: '2026-10-21T00:00:00.000Z' }),
    );
  });
  await page.goto(path);
  await expect(page.getByTestId('app-ready')).toBeAttached();
}

export async function resultNames(page: Page): Promise<string[]> {
  const names: string[] = [];
  const settled = page.getByTestId('result-card').first().or(page.getByText('No eligible attorneys'));
  await expect(settled).toBeVisible();
  for (let i = 0; i < 6; i++) {
    const text = (await page.getByTestId('result-count').innerText()).trim();
    if (text.startsWith('0')) break;
    await expect(page.getByTestId('result-card').first()).toBeVisible();
    names.push(...(await page.getByTestId('result-name').allTextContents()));
    const next = page.getByRole('button', { name: 'Next page' });
    if ((await next.count()) === 0 || (await next.isDisabled())) break;
    await next.click({ noWaitAfter: true });
    await expect(page.getByText(new RegExp(`Page ${i + 2} of`))).toBeVisible();
    await expect(page.getByTestId('result-card').first()).toBeVisible();
  }
  return names;
}

export async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
