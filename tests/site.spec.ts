import { expect, test } from '@playwright/test';
import { boot, noOverflow } from './helpers';

test('home is a real directory pitch with no fictional attorneys', async ({ page }) => {
  await boot(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fresh out of law school.');
  const bar = page.getByTestId('attorney-announcement');
  await expect(bar).toHaveText('California attorney? Join free as a Founding Member →');
  await expect(bar).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('nav-join')).toHaveText('Attorneys: Join free');
  await expect(page.getByTestId('nav-join')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('home-attorney-cta')).toHaveText("I'm an attorney — apply free");
  await expect(page.getByTestId('home-attorney-cta')).toHaveAttribute('href', '/join/');
  const forAttorneys = page.getByTestId('home-for-attorneys');
  await expect(forAttorneys).toContainText('Founding Member');
  await expect(forAttorneys).toContainText('Free listing');
  await expect(forAttorneys).toContainText('Set your own rate');
  await expect(forAttorneys).toContainText('No referral fee');
  await expect(page.getByTestId('home-apply')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('benefit-verified')).toBeVisible();
  await expect(page.getByTestId('benefit-more-affordable')).toBeVisible();
  await expect(page.getByTestId('benefit-newly-licensed')).toBeVisible();
  await expect(page.getByTestId('benefit-wide-range')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Interactive demo|Maya R|Jordan K|fictional/i);
  expect(body).not.toMatch(/\bDEMO\b/);
  await page.getByTestId('waitlist-email').fill('reader@example.com');
  await page.getByTestId('waitlist-submit').click();
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /reader%40example.com/);
});

test('directory explains that founding attorneys are still joining', async ({ page }) => {
  await boot(page, '/find-lawyer/?specialty=contracts');
  await expect(page.getByTestId('attorney-announcement')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('directory-empty')).toContainText('Founding attorneys joining now — launching soon');
  await expect(page.getByLabel('Practice area')).toHaveValue('contracts');
  await page.getByTestId('directory-email').fill('casey@example.com');
  await page.getByTestId('directory-waitlist').click();
  await expect(page.getByTestId('directory-mailto')).toHaveAttribute('href', /casey%40example.com/);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Maya|Jordan|fictional review/i);
});

test('founding member application keeps every field in the email fallback', async ({ page }) => {
  await boot(page, '/for-attorneys/');
  await page.getByTestId('founding-cta').click();
  await expect(page).toHaveURL(/\/join\/?/);
  await page.getByTestId('apply-name').fill('Alex Rivera');
  await page.getByTestId('apply-email').fill('alex.rivera@example.com');
  await page.getByTestId('apply-phone').fill('4155551212');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-bar').fill('123456');
  await page.getByTestId('apply-admitted').fill('2026-10-30');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-specialty-contracts').click();
  await page.getByTestId('apply-specialty-real-estate').click();
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-cities').fill('Oakland');
  await page.getByTestId('apply-languages').fill('English, Spanish');
  await page.getByTestId('apply-bio').fill('I help East Bay clients with everyday contracts and residential paperwork.');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-rate-hourly').check();
  await page.getByTestId('apply-rate-amount').fill('225');
  await page.getByTestId('apply-contact').fill('https://example.com/book');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-insurance').check();
  await page.getByTestId('apply-terms').check();
  await page.getByTestId('application-submit').click();
  await expect(page).toHaveURL(/confirmation/);
  await expect(page.getByTestId('verification-explainer')).toContainText(/manual/i);
  await expect(page.getByTestId('verification-explainer')).toContainText(/State Bar/i);
  const mailto = page.getByTestId('application-mailto');
  await expect(mailto).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  const href = await mailto.getAttribute('href');
  const decoded = decodeURIComponent(href ?? '');
  expect(decoded).toContain('Alex Rivera');
  expect(decoded).toContain('alex.rivera@example.com');
  expect(decoded).toContain('4155551212');
  expect(decoded).toContain('123456');
  expect(decoded).toContain('2026-10-30');
  expect(decoded).toContain('Oakland');
  expect(decoded).toContain('English, Spanish');
  expect(decoded).toContain('225');
  expect(decoded).toContain('https://example.com/book');
  expect(decoded).toContain('Contracts');
});

test('policies name Legalgrads and do not charge a referral fee', async ({ page }) => {
  await boot(page, '/attorney-terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Attorney Terms');
  const terms = await page.locator('main').innerText();
  expect(terms).toContain('Legalgrads');
  expect(terms).toMatch(/no referral fee/i);
  expect(terms).toMatch(/no share of (your )?legal fees/i);
  expect(terms).toContain('ryan@legalgrads.com');
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of Service');
  await expect(page.getByText('Draft — pending legal review')).toBeVisible();
  await page.goto('/pricing/');
  const pricing = await page.locator('main').innerText();
  expect(pricing).toMatch(/flat fee for extra visibility/i);
  expect(pricing).toMatch(/does not charge per lead/i);
});

test('phase 2 tools are not linked', async ({ page }) => {
  await boot(page);
  const hrefs = await page.locator('header a, footer a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  expect(hrefs.join(' ')).not.toMatch(/admin\/review|attorney\/login|attorneys\/profile/);
  await page.goto('/admin/review/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not public yet');
  await page.goto('/attorney/login/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not public yet');
});

test('cookie choice persists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('cookie-banner')).toBeVisible();
  await page.getByTestId('cookie-reject').click();
  await page.reload();
  await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
});

test('layout holds at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/', '/find-lawyer/', '/for-attorneys/', '/join/', '/privacy/']) {
    await boot(page, path);
    await noOverflow(page);
  }
});
