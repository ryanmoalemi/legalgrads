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
  await expect(page.locator('nav[aria-label="Result pages, top"] a[rel="next"]')).toHaveAttribute('href', '/attorneys/ny/new-york/page/2/');
  const two = await (await request.get('/attorneys/ny/new-york/page/2/')).text();
  expect(two).toContain('rel="canonical" href="https://legalgrads.com/attorneys/ny/new-york/page/2/"');
  expect(two).toContain('page 2 of');
  const small = await (await request.get('/attorneys/ca/escondido/')).text();
  expect(small).toContain('href="/attorneys/ca/escondido/callie-yahyavi-369241/"');
  expect(small).not.toContain('Result pages');
});

test('state hub city filter hides empty sections and letters, and clears', async ({ page }) => {
  await page.goto('/attorneys/ca/');
  const filter = page.getByTestId('city-filter');
  await filter.fill('Los Ang');
  await expect(page.getByTestId('city-filter-status')).toHaveText(/\d+ cit(y matches|ies match)\./);
  // Matching tiles come right after the search: no empty letter groups, no alphabet, no unlisted section.
  await expect(page.locator('[data-letter="A"]')).toBeHidden();
  const emptyVisible = await page.locator('[data-letter]').evaluateAll((groups) => groups.filter((g) => (g as HTMLElement).offsetParent && !g.querySelector('[data-city]:not([hidden])')).length);
  expect(emptyVisible).toBe(0);
  await expect(page.locator('[data-letter-nav]')).toBeHidden();
  await expect(page.locator('[data-unlisted]')).toBeHidden();
  const visible = page.locator('[data-city]:visible');
  expect(await visible.count()).toBeGreaterThan(0);
  for (const label of await visible.allInnerTexts()) expect(label.toLowerCase()).toMatch(/los ang/);
  const tile = page.locator('a[href="/attorneys/ca/los-angeles/"]');
  const box = await tile.boundingBox();
  const input = await filter.boundingBox();
  expect(box && input && box.y - input.y).toBeLessThan(400);
  // A misspelling published on records still finds the canonical city.
  await filter.fill('Los Angles');
  await expect(tile).toBeVisible();
  await page.getByTestId('city-filter-clear').click();
  await expect(filter).toHaveValue('');
  await expect(page.locator('[data-letter-nav]')).toBeVisible();
  await expect(page.locator('[data-unlisted]')).toBeVisible();
  await filter.fill('zzzz');
  await expect(page.getByTestId('city-filter-status')).toContainText('No cities match');
});

test('geography: one unknown group, verified out-of-state offices, merged spellings with redirects', async ({ page, request }) => {
  await page.goto('/attorneys/ca/');
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/Ca 91505|Ca 94025|Calgary Ab|Los Angles|Los Angelews|San Bernrdno/);
  expect(body).not.toContain('California, CA');
  await expect(page.locator('#unlisted-h')).toContainText('Office location not listed');
  await expect(page.locator('[data-unlisted] a')).toHaveCount(1);
  await expect(page.locator('section[aria-labelledby="cities-h"] a[href="/attorneys/ca/denver/"]')).toHaveCount(0);
  await expect(page.locator('section[aria-labelledby="elsewhere-h"] a[href="/attorneys/ca/denver-co/"]')).toContainText('Denver, CO');
  const moved = await (await request.get('/attorneys/ca/los-angelews/')).text();
  expect(moved).toContain('url=/attorneys/ca/los-angeles/');
  const junk = await (await request.get('/attorneys/ca/ca-91505/')).text();
  expect(junk).toContain('url=/attorneys/ca/burbank/');
  // Profile URLs never move; the profile links to its normalized group.
  const profile = await request.get('/attorneys/ca/denver/');
  expect(profile.status()).toBe(200);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/attorneys/ca/los-angelews/');
});

test('city pages keep location context in name search and paginate at both ends', async ({ page }) => {
  await page.goto('/attorneys/ny/new-york/');
  await expect(page.locator('nav[aria-label="Result pages, bottom"] a[rel="next"]')).toHaveAttribute('href', '/attorneys/ny/new-york/page/2/');
  await expect(page.getByTestId('city-count')).toContainText('Sorted A to Z by first name, not ranked');
  await page.getByTestId('city-name-search').fill('Aaron');
  await page.getByTestId('city-name-search').press('Enter');
  await expect(page).toHaveURL(/\/find-lawyer\/\?state=NY&city=New\+York&q=Aaron/);
  await expect(page.getByTestId('filter-state')).toHaveValue('NY');
  await expect(page.getByTestId('filter-name')).toHaveValue('Aaron');
  await expect(page.getByTestId('result-count')).toContainText('Name: Aaron');
  for (const name of (await page.getByTestId('attorney-card').locator('h3').allInnerTexts())) expect(name.toLowerCase()).toContain('aaron');
});

test('search rows show office state for offices outside the licensing state', async ({ page }) => {
  await boot(page, '/find-lawyer/?state=CA&city=Denver');
  await expect(page.getByTestId('attorney-card').first()).toContainText('Office: Denver, CO');
});
