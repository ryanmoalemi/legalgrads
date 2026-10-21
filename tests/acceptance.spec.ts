import { expect, test } from '@playwright/test';
import { boot, noOverflow, resultNames } from './helpers';

test.beforeEach(async ({ page }) => {
  await boot(page);
});

test('1. Contracts on the homepage stays selected and matches contracts attorneys', async ({ page }) => {
  await page.getByTestId('specialty-contracts').click();
  await expect(page.getByTestId('selected-specialties')).toContainText('Contracts');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'See matching attorneys' }).click();
  await expect(page).toHaveURL(/results/);
  const names = await resultNames(page);
  expect(names.some((n) => n.includes('Maya'))).toBeTruthy();
  expect(names.some((n) => n.includes('Chris'))).toBeTruthy();
  expect(names.some((n) => n.includes('Jordan'))).toBeFalsy();
  expect(names.join(' ')).not.toMatch(/Kevin|Daniel|Ryan P/);
});

test('2. California filter keeps only California-eligible attorneys', async ({ page }) => {
  await page.goto('/find-lawyer/results/');
  await page.getByLabel('Licensed jurisdiction').selectOption('CA');
  await expect(page.getByTestId('result-count')).toContainText('4');
  const names = await resultNames(page);
  expect(names).toHaveLength(4);
  for (const name of names) expect(name).not.toMatch(/Jordan|Samantha|Emily|Taylor|Brianna|Kevin|Daniel|Ryan/);
  expect(names.join(' ')).toMatch(/Maya/);
});

test('3. Saving Maya survives a reload', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/attorneys/maya-r/');
  await page.getByTestId('save-attorney').click();
  await expect(page.getByTestId('save-attorney')).toHaveText('Saved');
  await page.goto('/client/saved/');
  await expect(page.getByRole('link', { name: 'Maya R., Esq.' })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('app-ready')).toBeAttached();
  await expect(page.getByRole('link', { name: 'Maya R., Esq.' })).toBeVisible();
});

test('4. A consultation request shows up for the attorney', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/attorneys/maya-r/');
  await page.locator('#consult textarea[name="description"]').fill('Walkthrough NDA for Maya');
  await page.getByTestId('request-consultation').click();
  await expect(page).toHaveURL(/client\/requests/);
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/dashboard/');
  await expect(page.getByText('Walkthrough NDA for Maya')).toBeVisible();
});

test('5. A proposed slot can be confirmed on both calendars', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/attorneys/maya-r/');
  await page.locator('#consult textarea[name="description"]').fill('Slot test consult');
  await page.getByTestId('request-consultation').click();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/leads/');
  await page.getByRole('link', { name: /Slot test consult/ }).click();
  await page.getByTestId('propose-slot').first().click();
  await expect(page.getByText('Saved in this browser.')).toBeVisible();
  await page.getByTestId('role-client').click();
  await page.goto('/client/appointments/');
  await page.getByTestId('confirm-appointment').click();
  await expect(page.getByText('Confirmed').first()).toBeVisible();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/calendar/');
  await expect(page.getByText('Confirmed').first()).toBeVisible();
});

test('6. Messages travel both directions across the role switch', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/client/messages/?id=convo_casey_maya');
  await page.getByTestId('message-body').fill('Hello from the client demo');
  await page.getByTestId('send-message').click();
  await expect(page.getByText('Hello from the client demo')).toBeVisible();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/messages/?id=convo_casey_maya');
  await expect(page.getByText('Hello from the client demo')).toBeVisible();
  await page.getByTestId('message-body').fill('Reply from Maya');
  await page.getByTestId('send-message').click();
  await expect(page.getByText('Reply from Maya')).toBeVisible();
  await page.getByTestId('role-client').click();
  await page.goto('/client/messages/?id=convo_casey_maya');
  await expect(page.getByText('Reply from Maya')).toBeVisible();
});

test('7. Editing the rate and adding a service updates profile and search', async ({ page }) => {
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/services/');
  await page.getByTestId('hourly-rate').fill('210');
  await page.getByTestId('save-rate').click();
  await page.getByTestId('service-title').fill('Demo NDA Sprint');
  await page.getByTestId('service-price').fill('275');
  await page.locator('textarea[name="scope"]').fill('Fictional fixed-fee NDA markup.');
  await page.getByTestId('add-service').click();
  await expect(page.getByText('Demo NDA Sprint')).toBeVisible();
  await page.goto('/attorneys/maya-r/');
  await expect(page.getByRole('heading', { name: 'Maya R., Esq.' })).toBeVisible();
  await expect(page.getByText('$210/hr')).toBeVisible();
  await expect(page.getByText('Demo NDA Sprint')).toBeVisible();
  await page.goto('/find-lawyer/results/');
  await expect(page.getByTestId('result-card').filter({ hasText: 'Maya' })).toContainText('$210/hr');
});

test('8. Conflict clearance and acceptance create an active matter for both sides', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/attorneys/maya-r/');
  await page.locator('#consult textarea[name="description"]').fill('Engagement walkthrough');
  await page.getByTestId('request-consultation').click();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/leads/');
  await page.getByRole('link', { name: /Engagement walkthrough/ }).click();
  await page.getByTestId('conflict-clear').click();
  await page.getByTestId('send-proposal').click();
  await expect(page.getByText('Saved in this browser.')).toBeVisible();
  await page.getByTestId('role-client').click();
  await page.goto('/client/requests/');
  await page.getByRole('link', { name: /Engagement walkthrough/ }).click();
  await page.getByTestId('payment-confirm').check();
  await page.getByTestId('accept-proposal').click();
  await expect(page.getByTestId('matter-status')).toContainText('active');
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/dashboard/');
  await expect(page.getByText('Active matters')).toBeVisible();
  await page.goto('/attorney/matters/');
  await expect(page.getByTestId('matter-status').first()).toContainText('active');
});

test('9. Completing a matter lets the client post a DEMO review', async ({ page }) => {
  await page.getByTestId('role-client').click();
  await page.goto('/attorneys/maya-r/');
  await page.locator('#consult textarea[name="description"]').fill('Review matter walkthrough');
  await page.getByTestId('request-consultation').click();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/leads/');
  await page.getByRole('link', { name: /Review matter walkthrough/ }).click();
  await page.getByTestId('conflict-clear').click();
  await page.getByTestId('send-proposal').click();
  await page.getByTestId('role-client').click();
  await page.goto('/client/requests/');
  await page.getByRole('link', { name: /Review matter walkthrough/ }).click();
  await page.getByTestId('payment-confirm').check();
  await page.getByTestId('accept-proposal').click();
  await page.getByRole('link', { name: 'Open matter' }).click();
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/matters/');
  await page.locator('a[href*="/attorney/matters/?id="]').first().click();
  await page.getByTestId('complete-matter').click();
  await expect(page.getByTestId('matter-status')).toContainText('completed');
  await page.getByTestId('role-client').click();
  await page.goto('/client/matters/');
  await page.locator('a[href*="/client/matters/?id="]').first().click();
  await page.getByTestId('review-text').fill('Fictional demo review from the walkthrough.');
  await page.getByTestId('submit-review').click();
  await expect(page.getByText('Fictional demo review from the walkthrough.')).toBeVisible();
  await page.goto('/attorneys/maya-r/');
  await expect(page.getByTestId('demo-review')).toContainText('Fictional demo review from the walkthrough.');
  await expect(page.getByText('Fictional demo review').first()).toBeVisible();
});

test('10. Pending, unlicensed, and out-of-window attorneys are not bookable', async ({ page }) => {
  await page.goto('/find-lawyer/results/');
  await expect(page.getByTestId('result-count')).toContainText('9');
  const names = await resultNames(page);
  expect(names.join(' ')).not.toMatch(/Kevin|Daniel|Ryan P/);
  await page.goto('/attorneys/kevin-s/');
  await expect(page.getByRole('status')).toContainText(/hidden from search|not approved/i);
  await expect(page.getByTestId('request-consultation')).toBeDisabled();
  await page.goto('/attorneys/ryan-p/');
  await expect(page.getByRole('status')).toContainText(/Not admitted/i);
  await page.goto('/attorneys/daniel-m/');
  await expect(page.getByRole('status')).toContainText(/eligibility window/i);
});

test('11. Another client cannot read Casey’s inquiry', async ({ page }) => {
  await page.getByTestId('demo-user-select').selectOption('user_sam');
  await page.goto('/client/requests/?id=inq_casey_maya');
  await expect(page.getByTestId('access-denied')).toBeVisible();
  await expect(page.getByText('Please review a fictional demo NDA')).toHaveCount(0);
  await page.goto('/client/messages/?id=convo_casey_maya');
  await expect(page.getByTestId('access-denied')).toBeVisible();
});

test('12. Saved data is still there after refresh', async ({ page }) => {
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/services/');
  await page.getByTestId('hourly-rate').fill('188');
  await page.getByTestId('save-rate').click();
  await page.reload();
  await expect(page.getByTestId('app-ready')).toBeAttached();
  await expect(page.getByTestId('hourly-rate')).toHaveValue('188');
});

test('13. Reset Demo restores the seed', async ({ page }) => {
  await page.getByTestId('role-attorney').click();
  await page.goto('/attorney/services/');
  await page.getByTestId('hourly-rate').fill('222');
  await page.getByTestId('save-rate').click();
  await page.getByTestId('reset-demo').click();
  await expect(page.getByTestId('reset-status')).toContainText('Demo data restored');
  await expect(page.getByTestId('hourly-rate')).toHaveValue('150');
});

test('14. Layout holds at 375px and shows four benefit icons', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/', '/find-lawyer/', '/find-lawyer/results/', '/attorneys/maya-r/', '/how-it-works/', '/for-attorneys/', '/privacy/']) {
    await page.goto(path);
    await expect(page.getByTestId('app-ready')).toBeAttached();
    await noOverflow(page);
  }
  await page.goto('/');
  await expect(page.getByTestId('benefit-more-affordable')).toBeVisible();
  await expect(page.getByTestId('benefit-newly-licensed')).toBeVisible();
  await expect(page.getByTestId('benefit-verified')).toBeVisible();
  await expect(page.getByTestId('benefit-wide-range')).toBeVisible();
  await page.getByTestId('nav-toggle').click();
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Find a Lawyer' }).click();
  await expect(page).toHaveURL(/find-lawyer/);
});

test('15. No dead controls or real verification, payment, or press claims', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const paths = ['/', '/how-it-works/', '/for-attorneys/', '/pricing/', '/faq/', '/contact/', '/attorneys/maya-r/', '/find-lawyer/results/'];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('a[href="#"], a:not([href])').count()).toBe(0);
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const type = await buttons.nth(i).getAttribute('type');
      expect(type === 'button' || type === 'submit').toBeTruthy();
    }
  }
  await page.goto('/attorneys/maya-r/');
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/123456|TechCrunch|As seen in|Wall Street Journal/);
  expect(body).toMatch(/DEMO/);
  expect(body).toMatch(/simulated/i);
  expect(body).not.toMatch(/card number/i);
  expect(errors).toEqual([]);
});
