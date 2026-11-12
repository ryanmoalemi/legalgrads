import { expect, test } from '@playwright/test';
import { boot, noOverflow } from './helpers';

test('search directory pages results and keeps one main landmark', async ({ page }) => {
  await boot(page, '/find-lawyer/');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByTestId('result-count')).toContainText(/profiles/);
  const first = await page.getByTestId('attorney-card').count();
  expect(first).toBeGreaterThan(0);
  expect(first).toBeLessThanOrEqual(20);
  await page.getByTestId('next-page').click();
  await expect(page).toHaveURL(/[?&]page=2/);
  await page.goBack();
  await expect(page).not.toHaveURL(/[?&]page=2/);
});

test('search filters fold into a disclosure on phones without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await boot(page, '/find-lawyer/');
  await expect(page.getByTestId('filter-state')).toBeHidden();
  await page.locator('.lg-dir__disclosure > summary').click();
  await expect(page.getByTestId('filter-state')).toBeVisible();
  await noOverflow(page);
});

test('state hub groups cities, filters them, and has one main', async ({ page }) => {
  await page.goto('/attorneys/ca/');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Attorneys licensed in California');
  await expect(page.locator('a[href="/attorneys/ca/los-angeles/"]')).toHaveCount(1);
  await page.getByTestId('city-filter').fill('escon');
  await expect(page.locator('a[href="/attorneys/ca/escondido/"]')).toBeVisible();
  await expect(page.locator('a[href="/attorneys/ca/los-angeles/"]')).toBeHidden();
  expect(await page.locator('body').innerText()).not.toContain('California, CA');
});

test('large city directories paginate with crawlable links to every profile', async ({ page, request }) => {
  await page.goto('/attorneys/ny/new-york/');
  await expect(page.locator('main')).toHaveCount(1);
  const rows = page.getByTestId('city-rows').locator('a');
  await expect(rows).toHaveCount(100);
  await expect(page.locator('nav[aria-label="Result pages"] a[rel="next"]')).toHaveAttribute('href', '/attorneys/ny/new-york/page/2/');
  const two = await (await request.get('/attorneys/ny/new-york/page/2/')).text();
  expect(two).toContain('rel="canonical" href="https://legalgrads.com/attorneys/ny/new-york/page/2/"');
  expect(two).toContain('page 2 of');
  const small = await (await request.get('/attorneys/ca/escondido/')).text();
  expect(small).toContain('href="/attorneys/ca/escondido/callie-yahyavi-369241/"');
  expect(small).not.toContain('Result pages');
});
