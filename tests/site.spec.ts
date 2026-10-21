import { expect, test } from '@playwright/test';
import { boot, noOverflow } from './helpers';

test('home is a real directory pitch with no fictional attorneys', async ({ page }) => {
  await boot(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fresh out of law school.');
  const bar = page.getByTestId('attorney-announcement');
  await expect(bar).toHaveText('California attorney? Get a free listing →');
  await expect(bar).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('nav-join')).toHaveText('Attorneys: Free listing');
  await expect(page.getByTestId('nav-join')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('home-attorney-cta')).toHaveText('Get your free listing');
  await expect(page.getByTestId('home-attorney-cta')).toHaveAttribute('href', '/join/');
  const forAttorneys = page.getByTestId('home-for-attorneys');
  await expect(forAttorneys).toContainText('Free listing');
  await expect(forAttorneys).not.toContainText('Founding Member');
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
  expect(body).not.toMatch(/Founding Member|first year|forever/i);
  await page.getByTestId('waitlist-email').fill('reader@example.com');
  await page.getByTestId('waitlist-submit').click();
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /reader%40example.com/);
});

test('directory explains that attorneys are still joining', async ({ page }) => {
  await boot(page, '/find-lawyer/?specialty=contracts');
  await expect(page.getByTestId('attorney-announcement')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('directory-empty')).toContainText('Attorneys joining now — launching soon');
  await expect(page.getByLabel('Practice area')).toHaveValue('contracts');
  await page.getByTestId('directory-email').fill('casey@example.com');
  await page.getByTestId('directory-waitlist').click();
  await expect(page.getByTestId('directory-mailto')).toHaveAttribute('href', /casey%40example.com/);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Maya|Jordan|fictional review/i);
});

test('free listing application keeps every field in the email fallback', async ({ page }) => {
  await boot(page, '/for-attorneys/');
  await expect(page.getByTestId('sample-listing')).not.toContainText('Founding Member');
  await expect(page.getByTestId('sample-listing')).toContainText('Find an attorney');
  await expect(page.getByRole('heading', { name: 'Is Legalgrads a referral service?' })).toBeVisible();
  await expect(page.getByTestId('invite-classmate')).toBeVisible();
  await page.getByTestId('founding-cta').click();
  await expect(page).toHaveURL(/#you/);
  await page.getByTestId('apply-name').fill('Alex Rivera');
  await page.reload();
  await expect(page.getByTestId('apply-name')).toHaveValue('Alex Rivera');
  await page.getByTestId('apply-email').fill('alex.rivera@example.com');
  await page.getByTestId('apply-email-private').check();
  await page.getByTestId('apply-phone').fill('4155551212');
  await page.getByTestId('apply-phone-private').check();
  await page.getByTestId('apply-next').click();
  await expect(page).toHaveURL(/#license/);
  await page.goBack();
  await expect(page).toHaveURL(/#you/);
  await expect(page.getByTestId('apply-name')).toHaveValue('Alex Rivera');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-bar').fill('12ab');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('apply-bar')).toHaveValue('12ab');
  await expect(page.getByText('Use digits only, up to 6.')).toBeVisible();
  await page.getByTestId('apply-bar').fill('123456');
  await page.getByTestId('apply-admitted').fill('2099-01-01');
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Admission date cannot be in the future.')).toBeVisible();
  await page.getByTestId('apply-admitted').fill('2020-06-01');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-specialty-contracts').click();
  await page.getByTestId('apply-specialty-real-estate').click();
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-cities').fill('Oakland');
  await page.getByTestId('apply-languages').fill('English, Spanish');
  await page.getByTestId('apply-bio').fill('I help East Bay clients with everyday contracts and residential paperwork.');
  await expect(page.getByTestId('bio-count')).toContainText('/ 600');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-rate-hourly').check();
  await page.getByTestId('apply-rate-amount').fill('10');
  await page.getByTestId('apply-rate-for').fill('Lease review');
  await page.getByTestId('apply-contact').fill('javascript:alert(1)');
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Enter at least $25.')).toBeVisible();
  await expect(page.getByText('That contact method is not allowed.')).toBeVisible();
  await page.getByTestId('apply-rate-amount').fill('225');
  await page.getByTestId('apply-starting-at').check();
  await page.getByTestId('apply-contact').fill('https://example.com/book');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('step-count')).toBeHidden();
  await expect(page.getByTestId('listing-preview')).toContainText('Alex Rivera');
  await expect(page.getByTestId('listing-preview')).toContainText('Find an attorney');
  await page.getByTestId('apply-insured').check();
  await expect(page.getByTestId('listing-preview')).toContainText('Insured');
  await page.getByTestId('apply-terms').check();
  await page.getByTestId('application-submit').click();
  await expect(page).toHaveURL(/confirmation/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('within 2 business days');
  await expect(page.getByTestId('verification-explainer')).toContainText('ryan@legalgrads.com');
  await expect(page.getByTestId('application-reference')).toHaveText(/LG-/);
  const mailto = page.getByRole('link', { name: 'Email us your application' });
  await expect(mailto).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  const decoded = decodeURIComponent(await mailto.getAttribute('href') ?? '');
  expect(decoded).toContain('Alex Rivera');
  expect(decoded).toContain('alex.rivera@example.com');
  expect(decoded).toContain('4155551212');
  expect(decoded).toContain('123456');
  expect(decoded).toContain('2020-06-01');
  expect(decoded).toContain('Oakland');
  expect(decoded).toContain('English, Spanish');
  expect(decoded).toContain('225');
  expect(decoded).toContain('Lease review');
  expect(decoded).toContain('https://example.com/book');
  expect(decoded).toContain('Contracts');
  expect(decoded).toContain('I carry professional liability insurance');
  expect(decoded).not.toMatch(/supabase|PGRST|row level/i);
  const confirmation = await page.locator('body').innerText();
  expect(confirmation).not.toMatch(/Founding Member|first year|forever/i);
  await expect(page.getByRole('button', { name: "Download “I'm on Legalgrads”" })).toBeVisible();
  await expect(page.getByTestId('share-panel')).not.toContainText('Founding Member');
});

test('application shows inline errors and the mobile step count', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await boot(page, '/join/');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('apply-name')).toBeFocused();
  await expect(page.getByTestId('apply-name')).toHaveAttribute('aria-invalid', 'true');
  await page.goto('/join/#license');
  await expect(page.getByTestId('step-count')).toHaveText('Step 2 of 6');
  await expect(page.getByRole('list', { name: 'Progress' }).getByRole('listitem').nth(1)).toHaveAttribute('aria-current', 'step');
});

test('policies name Legalgrads and do not charge a referral fee', async ({ page }) => {
  await boot(page, '/attorney-terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Attorney Terms');
  await expect(page.locator('main')).toContainText('In short:');
  const terms = await page.locator('main').innerText();
  expect(terms).toContain('Legalgrads');
  expect(terms).toMatch(/no referral fee/i);
  expect(terms).toMatch(/no share of (your )?legal fees/i);
  expect(terms).toContain('ryan@legalgrads.com');
  expect(terms).toMatch(/flat fee for extra visibility/i);
  expect(terms).not.toMatch(/Founding Member|first year|forever/i);
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of Service');
  await expect(page.getByText('Draft — pending legal review. October 21, 2026.')).toBeVisible();
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
