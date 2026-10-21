import { test } from '@playwright/test';
import { boot } from './helpers';

const shots = [
  ['/', 'home'],
  ['/find-lawyer/', 'intake'],
  ['/find-lawyer/results/', 'results'],
  ['/attorneys/maya-r/', 'profile'],
  ['/how-it-works/', 'how-it-works'],
  ['/for-attorneys/', 'for-attorneys'],
  ['/client/dashboard/', 'client-dashboard'],
  ['/attorney/dashboard/', 'attorney-dashboard'],
];

test('capture pitch screenshots', async ({ page }) => {
  test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1');
  await boot(page);
  for (const [path, name] of shots) {
    if (path.startsWith('/client/')) await page.getByTestId('role-client').click();
    if (path.startsWith('/attorney/')) await page.getByTestId('role-attorney').click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `/opt/cursor/artifacts/screenshots/${name}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `/opt/cursor/artifacts/screenshots/${name}-mobile.png`, fullPage: true });
  }
});
