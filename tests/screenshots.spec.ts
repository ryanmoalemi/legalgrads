import { test } from '@playwright/test';
import { boot } from './helpers';

test('capture launch screenshots', async ({ page }) => {
  test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1');
  const dir = '/opt/cursor/artifacts/screenshots';
  await boot(page);
  for (const [path, name] of [['/', 'home'], ['/for-attorneys/', 'for-attorneys']] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${dir}/${name}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${dir}/${name}-mobile.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/join/');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/apply-1-you-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const shots: [string, () => Promise<void>][] = [
    ['apply-1-you', async () => undefined],
    ['apply-2-license', async () => {
      await page.getByTestId('apply-name').fill('Alex Rivera');
      await page.getByTestId('apply-email').fill('alex.rivera@example.com');
      await page.getByTestId('apply-phone').fill('4155551212');
      await page.getByTestId('apply-next').click();
    }],
    ['apply-3-areas', async () => {
      await page.getByTestId('apply-bar').fill('123456');
      await page.getByTestId('apply-admitted').fill('2020-06-01');
      await page.getByTestId('apply-next').click();
    }],
    ['apply-4-practice', async () => {
      await page.getByTestId('apply-specialty-contracts').click();
      await page.getByTestId('apply-next').click();
    }],
    ['apply-5-rate', async () => {
      await page.getByTestId('apply-cities').fill('Oakland');
      await page.getByTestId('apply-languages').fill('English');
      await page.getByTestId('apply-bio').fill('I help East Bay clients with everyday contracts and residential paperwork.');
      await page.getByTestId('apply-next').click();
    }],
    ['apply-6-review', async () => {
      await page.getByTestId('apply-rate-hourly').check();
      await page.getByTestId('apply-rate-amount').fill('225');
      await page.getByTestId('apply-rate-for').fill('Lease review');
      await page.getByTestId('apply-next').click();
    }],
  ];
  for (const [name, step] of shots) {
    await step();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${dir}/${name}-mobile.png`, fullPage: true });
  }
  await page.getByTestId('apply-phone-private').check();
  await page.getByTestId('apply-contact').fill('https://example.com/book');
  await page.getByTestId('apply-insured').check();
  await page.getByTestId('apply-terms').check();
  await page.getByTestId('application-submit').click();
  await page.waitForURL(/confirmation/);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/confirmation-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/for-attorneys/');
  await page.getByTestId('message-attorney').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${dir}/message-attorney-mobile.png` });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByTestId('message-attorney').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${dir}/message-attorney-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId('message-name').fill('Casey Client');
  await page.getByTestId('message-email').fill('casey.client@example.com');
  await page.getByTestId('message-body').fill('Please see https://example.com/offer about my lease.');
  await page.getByTestId('message-consent').check();
  await page.getByTestId('message-submit').click();
  await page.getByText('Please remove links; describe your situation in words').waitFor();
  await page.getByTestId('sample-listing').screenshot({ path: `${dir}/message-link-error-mobile.png` });
});
