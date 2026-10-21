import { expect, test } from '@playwright/test';
import { boot } from './helpers';

const LEGAL = [
  ['/legal/', 'Legal'],
  ['/terms/', 'Terms of Service'],
  ['/privacy/', 'Privacy Policy'],
  ['/cookies/', 'Cookie Policy'],
  ['/cookie-settings/', 'Cookie settings'],
  ['/disclaimers/', 'Disclaimers'],
  ['/attorney-advertising/', 'Attorney Advertising'],
  ['/referral-disclosure/', 'Referral Disclosure'],
  ['/security/', 'Security'],
  ['/do-not-sell-or-share/', 'Do Not Sell or Share'],
  ['/privacy-request/', 'Privacy request'],
  ['/data-deletion/', 'Data deletion'],
  ['/accessibility/', 'Accessibility'],
  ['/report-abuse/', 'Report abuse'],
];

test('footer legal links open distinct draft pages', async ({ page }) => {
  await boot(page);
  const hrefs = await page.locator('footer a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  expect(new Set(hrefs).size).toBe(hrefs.length);
  const titles: string[] = [];
  for (const [href, title] of LEGAL) {
    await page.goto(href);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    titles.push((await heading.innerText()).trim());
    if (!['Cookie settings', 'Privacy request', 'Data deletion', 'Report abuse'].includes(title)) {
      await expect(page.getByText('DRAFT').first()).toBeVisible();
    }
  }
  expect(new Set(titles).size).toBe(titles.length);
});

test('cookie choice persists and gates demo analytics', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('cookie-banner')).toBeVisible();
  await page.getByTestId('cookie-reject').click();
  await page.reload();
  await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  await page.goto('/cookie-settings/');
  await page.getByTestId('analytics-event').click();
  await expect(page.getByTestId('analytics-status')).toContainText(/blocked/i);
  await page.getByLabel('Analytics').check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await page.getByTestId('analytics-event').click();
  await expect(page.getByTestId('analytics-status')).toContainText(/Recorded/i);
  await page.reload();
  await expect(page.getByLabel('Analytics')).toBeChecked();
});

test('privacy request is ticketed and can be rejected by the demo admin', async ({ page }) => {
  await boot(page);
  await page.goto('/privacy-request/');
  await page.getByLabel('Email').fill('casey@demo.legalgrads.test');
  await page.getByLabel('Request type').selectOption('deletion');
  await page.getByLabel('Details').fill('Please delete my demo profile.');
  await page.getByTestId('privacy-submit').click();
  const id = (await page.getByTestId('privacy-ticket').innerText()).trim();
  await page.getByTestId('role-admin').click();
  await page.goto('/admin/');
  await expect(page.getByTestId('admin-privacy')).toContainText(id);
  await page.getByLabel('Resolution').fill('Demo rejection: sample reason');
  await page.getByTestId('admin-privacy').getByRole('button', { name: 'Reject' }).click();
  await page.goto(`/privacy-request/?ticket=${id}`);
  await expect(page.getByText(/rejected/i)).toBeVisible();
  await expect(page.getByText('Demo rejection: sample reason')).toBeVisible();
});

test('registration requires draft terms and records the version', async ({ page }) => {
  await boot(page);
  await page.goto('/register/');
  await page.getByLabel('Full name').fill('Taylor Client');
  await page.getByLabel('Email').fill('taylor.client@demo.legalgrads.test');
  await page.getByLabel('Password').fill('demo1234');
  await page.getByTestId('register-age').check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(/terms/i);
  await page.getByTestId('register-terms').check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/verify-email/);
  await page.goto('/client/settings/');
  await expect(page.getByTestId('terms-version')).toContainText('2026-10-21-draft');
});

test('a not-yet-admitted attorney cannot publish', async ({ page }) => {
  await boot(page);
  await page.goto('/attorney/onboarding/');
  await page.getByLabel('Full name').fill('Pat Grad');
  await page.getByLabel('Email').fill('pat.grad@demo.legalgrads.test');
  await page.getByLabel('Password').fill('demo1234');
  await page.getByLabel('I am 18 or older').check();
  await page.getByLabel(/draft terms/i).check();
  await page.getByLabel('License status').selectOption('not_admitted');
  await page.getByLabel('Law school').fill('Fictional Law School');
  await page.getByLabel('Graduation year').fill('2026');
  await page.getByLabel('Bio').fill('Fictional draft profile only.');
  await page.getByTestId('publish-profile').click();
  await expect(page.getByTestId('publish-error')).toContainText(/cannot publish/i);
  await page.goto('/find-lawyer/results/?q=Pat%20Grad');
  await expect(page.getByTestId('result-count')).toContainText('0');
});

test('contact email is ryan@legalgrads.com and payments stay simulated', async ({ page }) => {
  await boot(page);
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: 'ryan@legalgrads.com' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByText('Legalgrads').first()).toBeVisible();
  await expect(page.getByText(/Demo payment — no money charged/)).toBeVisible();
  await expect(page.locator('input[autocomplete="cc-number"]')).toHaveCount(0);
});
