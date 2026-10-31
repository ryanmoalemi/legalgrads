import { expect, test } from '@playwright/test';
import { boot, noOverflow } from './helpers';

test('home is a real directory pitch with no fictional attorneys', async ({ page }) => {
  await boot(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fresh out of law school.');
  await expect(page.getByTestId('attorney-announcement')).toHaveCount(0);
  await expect(page.getByTestId('home-how')).toContainText('Browse attorneys near you');
  const joined = `Joined ${new Date().getFullYear()}`;
  await expect(page.getByTestId('nav-join')).toHaveText('Attorneys: join free');
  await expect(page.getByTestId('nav-join')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('home-attorney-cta')).toHaveText('Attorneys: join free');
  await expect(page.locator('h1')).toContainText('Licensed near you.');
  await expect(page.locator('main')).not.toContainText(/\bHire\b|Ready to work for you/);
  await expect(page.locator('footer')).not.toContainText(/Pricing|Referral disclosure/);
  await expect(page.locator('footer')).toContainText('Directory disclosure');
  await expect(page.getByTestId('home-attorney-cta')).toHaveAttribute('href', '/join/');
  const forAttorneys = page.getByTestId('home-for-attorneys');
  await expect(forAttorneys).toContainText(joined);
  await expect(forAttorneys).not.toContainText('Early Attorney');
  await expect(forAttorneys).not.toContainText('Founding Member');
  await expect(forAttorneys).toContainText('Free listing');
  await expect(forAttorneys).toContainText('Checked by hand');
  await expect(forAttorneys).toContainText('No referral fee');
  await expect(page.getByTestId('home-apply')).toHaveText('Join free');
  await expect(page.getByTestId('home-apply')).toHaveAttribute('href', '/join/');
  await expect(page.getByTestId('hero-sample-card')).toHaveCount(2);
  for (const card of await page.getByTestId('hero-sample-card').all()) {
    await expect(card).toContainText('Sample listing');
    await expect(card.locator('img')).toHaveAttribute('alt', /Sample listing photo/);
    expect(await card.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(page.getByTestId('benefit-verified')).toBeVisible();
  await expect(page.getByTestId('benefit-more-affordable')).toContainText('Free to browse');
  expect(await page.locator('body').innerText()).not.toMatch(/More Affordable|\/hr|set the rate/i);
  await expect(page.getByTestId('benefit-newly-licensed')).toBeVisible();
  await expect(page.getByTestId('benefit-wide-range')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Interactive demo|Maya R|Jordan K|fictional/i);
  expect(body).not.toMatch(/\bDEMO\b/);
  expect(body).not.toMatch(/Early Attorney|Founding Member|first year|forever/i);
  await page.getByTestId('waitlist-email').fill('reader@example.com');
  await page.getByTestId('waitlist-submit').click();
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /mailto:ryan@legalgrads.com/);
  await expect(page.getByTestId('waitlist-mailto')).toHaveAttribute('href', /reader%40example.com/);
});

test('home email pill fits and focus ring follows the pill on small phones', async ({ page }) => {
  for (const [width, height] of [[360, 740], [390, 844], [412, 500]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const input = page.getByTestId('waitlist-email');
    await expect(input).toHaveAttribute('placeholder', 'Your email');
    const fits = await input.evaluate((el: HTMLInputElement) => {
      const ctx = document.createElement('canvas').getContext('2d')!;
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
      return ctx.measureText(el.placeholder).width <= el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    });
    expect(fits).toBe(true);
    await input.focus();
    const outline = await input.evaluate((el) => { const cs = getComputedStyle(el); return cs.outlineStyle === 'none' || cs.outlineColor === 'rgba(0, 0, 0, 0)'; });
    expect(outline).toBe(true);
    expect(await page.locator('.waitlist-pill').evaluate((el) => getComputedStyle(el).boxShadow)).toContain('rgb(122, 0, 255)');
    const banner = page.getByTestId('cookie-banner');
    if (await banner.count()) await expect(banner).toBeHidden();
  }
});

test('directory lists unclaimed State Bar profiles and keeps the waitlist', async ({ page }) => {
  await boot(page, '/find-lawyer/?specialty=contracts');
  await expect(page.getByTestId('filter-state')).toBeVisible();
  await expect(page.getByText('No published attorneys match those filters yet.')).toBeVisible();
  await expect(page.getByLabel('Practice area')).toHaveValue('contracts');
  await page.getByTestId('directory-email').fill('casey@example.com');
  await page.getByTestId('directory-waitlist').click();
  await expect(page.getByTestId('directory-mailto')).toHaveAttribute('href', /casey%40example.com/);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Maya|Jordan|fictional review/i);
});

test('free listing application keeps every field in the email fallback', async ({ page }) => {
  await boot(page, '/for-attorneys/');
  await expect(page.getByTestId('founding-cta')).toHaveText('Join free');
  await expect(page.getByTestId('sample-listing')).toContainText(`Joined ${new Date().getFullYear()}`);
  await expect(page.getByTestId('sample-listing')).toContainText('not a rating');
  await expect(page.getByTestId('sample-listing')).not.toContainText('Early Attorney');
  await expect(page.getByTestId('sample-listing')).not.toContainText('Founding Member');
  await expect(page.getByTestId('sample-listing')).toContainText('Find an attorney');
  await expect(page.locator('main')).toContainText('Your email stays private. Clients reach you through our secure contact form.');
  await expect(page.getByTestId('message-attorney')).toContainText('Message this attorney');
  await expect(page.getByTestId('message-honeypot')).not.toBeInViewport();
  await page.getByTestId('message-name').fill('Casey Client');
  await page.getByTestId('message-email').fill('casey.client@example.com');
  await page.getByTestId('message-body').fill('Please see https://example.com/offer about my lease.');
  await page.getByTestId('message-consent').check();
  await page.getByTestId('message-submit').click();
  await expect(page.getByTestId('message-body')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Please remove links; describe your situation in words')).toBeVisible();
  await expect(page.getByTestId('message-status')).toHaveCount(0);
  await page.getByTestId('message-body').fill('I would like to ask about a lease review.');
  await page.getByTestId('message-submit').click();
  await expect(page.getByTestId('message-status')).toContainText('your email stays private');
  await expect(page.getByRole('heading', { name: 'Is Legalgrads a referral service?' })).toBeVisible();
  await expect(page.getByTestId('invite-classmate')).toBeVisible();
  await page.getByTestId('founding-cta').click();
  await expect(page).toHaveURL(/#you/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Join Legalgrads free');
  await expect(page.getByTestId('step-count')).toHaveText('Step 1 of 5 · You');
  await expect(page.getByRole('progressbar', { name: 'Progress' })).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByTestId('apply-phone')).toHaveAttribute('type', 'tel');
  await expect(page.getByTestId('apply-phone')).toHaveAttribute('autocomplete', 'tel');
  await expect(page.getByTestId('apply-phone')).toHaveAttribute('aria-required', 'true');
  await expect(page.getByText('Required so we can reach you about your application and state bar check. Private unless you choose to show it on your listing.')).toBeVisible();
  await page.getByTestId('apply-name').fill('Alex Rivera');
  await page.reload();
  await expect(page.getByTestId('apply-name')).toHaveValue('Alex Rivera');
  await page.getByTestId('apply-email').fill('alex.rivera@example.com');
  await page.getByTestId('apply-phone').fill('555-1212');
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Enter a 10-digit US phone number.')).toBeVisible();
  await expect(page).toHaveURL(/#you/);
  await page.getByTestId('apply-phone').fill('4155551212');
  await expect(page.getByTestId('apply-phone')).toHaveValue('(415) 555-1212');
  await page.getByTestId('apply-next').click();
  await expect(page).toHaveURL(/#license/);
  const stepTop = await page.locator('#join-step').evaluate((el) => el.getBoundingClientRect().top);
  expect(stepTop).toBeGreaterThanOrEqual(0);
  expect(stepTop).toBeLessThan(48);
  await page.goBack();
  await expect(page).toHaveURL(/#you/);
  await expect(page.getByTestId('apply-name')).toHaveValue('Alex Rivera');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('apply-bar')).toHaveAttribute('maxlength', '12');
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Choose the state where you are licensed.')).toBeVisible();
  await expect(page.getByText('Use letters and digits only, up to 12.')).toBeVisible();
  await expect(page.getByTestId('apply-state').locator('option')).toHaveCount(52);
  await page.getByTestId('apply-state').selectOption('CA');
  await expect(page.getByTestId('bar-lookup')).toHaveAttribute('href', 'https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch');
  await expect(page.getByTestId('step-dots').locator('li')).toHaveCount(5);
  await expect(page.locator('h1')).toHaveCSS('font-weight', '900');
  await page.getByTestId('apply-bar').fill('12-ab');
  await expect(page.getByTestId('apply-bar')).toHaveValue('12ab');
  await page.getByTestId('apply-bar').fill('123456');
  await page.getByTestId('apply-admitted').fill('2099-01-01');
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Admission date cannot be in the future.')).toBeVisible();
  await page.getByTestId('apply-admitted').fill('2020-06-01');
  await page.getByTestId('apply-next').click();
  await page.getByTestId('apply-specialty-contracts').click();
  await page.getByTestId('apply-specialty-real-estate').click();
  await page.getByTestId('apply-next').click();
  await expect(page.getByText('Separate cities with commas, for example: Springfield, Riverside.')).toBeVisible();
  await expect(page.getByText('Separate languages with commas, for example: English, Spanish.')).toBeVisible();
  await expect(page.getByTestId('apply-cities')).not.toHaveAttribute('placeholder', /.+/);
  await expect(page.getByText(/admitted to the bar in 2025/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose photo' })).toBeVisible();
  await expect(page.getByText('Drag the zoom to frame the circle.')).toHaveCount(0);
  await page.getByTestId('apply-cities').fill('Oakland');
  await page.getByTestId('apply-languages').fill('English, Spanish');
  await page.getByTestId('apply-bio').fill('I help East Bay clients with everyday contracts and residential paperwork.');
  await expect(page.getByTestId('bio-count')).toContainText('/ 600');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('step-count')).toHaveText('Step 5 of 5 · Review');
  await expect(page.getByTestId('listing-preview')).toContainText('Alex Rivera');
  await expect(page.getByTestId('listing-preview')).not.toContainText('not a rating');
  await expect(page.getByTestId('listing-message-preview')).toContainText('Message this attorney');
  await expect(page.getByTestId('listing-message-preview')).toContainText('Your email stays hidden.');
  await expect(page.getByTestId('listing-location')).toHaveText('California · Oakland');
  await expect(page.getByTestId('listing-languages')).toContainText('English, Spanish');
  await expect(page.getByTestId('listing-preview').getByText('I help East Bay clients', { exact: false })).toHaveCount(1);
  await expect(page.getByTestId('review-privacy')).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Clients contact me directly');
  await expect(page.getByTestId('listing-details')).toContainText('Phone visibility');
  await expect(page.getByTestId('listing-details')).toContainText('Insurance');
  await expect(page.getByTestId('listing-preview').locator('input, textarea, select, button')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Listing details' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Phone visibility' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Insurance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Terms' })).toBeVisible();
  await expect(page.getByText('Optional', { exact: true })).toBeVisible();
  await expect(page.getByText("I don't. I'll tell clients in writing if my state's rules require it.")).toBeVisible();
  await expect(page.locator('main')).not.toContainText('1.4.2');
  await expect(page.locator('main')).not.toContainText('Show your email on the public listing?');
  await expect(page.locator('main')).not.toContainText('How else clients reach you');
  await expect(page.getByTestId('apply-phone-public')).not.toBeChecked();
  await expect(page.getByTestId('apply-phone-private')).toBeChecked();
  await page.getByTestId('apply-contact').fill('javascript:alert(1)');
  await page.getByTestId('application-submit').click();
  await expect(page.getByText('That contact method is not allowed.')).toBeVisible();
  await page.getByTestId('apply-contact').fill('alex.rivera@example.com');
  await page.getByTestId('application-submit').click();
  await expect(page.getByText('Use an https link. Your email stays private.')).toBeVisible();
  await page.getByTestId('apply-contact').fill('');
  await page.getByTestId('application-submit').click();
  await expect(page.getByText('Enter a full https link, or leave this blank.')).toHaveCount(0);
  await page.getByTestId('apply-contact').fill('https://example.com/book');
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
  expect(decoded).toContain('(415) 555-1212');
  expect(decoded).toContain('123456');
  expect(decoded).toContain('2020-06-01');
  expect(decoded).toContain('Oakland');
  expect(decoded).toContain('English, Spanish');
  expect(decoded).toContain('State of licensure: California (CA)');
  expect(decoded).not.toMatch(/Rate:/);
  expect(decoded).toContain('https://example.com/book');
  expect(decoded).toContain('Email on public listing: no');
  expect(decoded).toContain('Contracts');
  expect(decoded).toContain('I carry professional liability insurance');
  expect(decoded).not.toMatch(/supabase|PGRST|row level/i);
  const confirmation = await page.locator('body').innerText();
  const joined = `Joined ${new Date().getFullYear()}`;
  expect(confirmation.match(new RegExp(joined, 'g'))).toHaveLength(1);
  expect(confirmation.match(/within 2 business days/gi)).toHaveLength(1);
  expect(confirmation).toMatch(/not a rating/i);
  expect(confirmation).toMatch(/not a benefit to clients/i);
  expect(confirmation).toMatch(/after approval/i);
  expect(confirmation).not.toMatch(/\bInsured\b/);
  expect(confirmation).not.toMatch(/Early Attorney|Founding Member|first year|forever/i);
  await expect(page.getByTestId('share-panel')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Download/ })).toHaveCount(0);
});

test('join mobile pins the action bar and uses a one-line footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await boot(page, '/join/');
  const bar = page.getByTestId('apply-actions');
  const barBox = await bar.boundingBox();
  expect(barBox).toBeTruthy();
  expect(barBox!.y + barBox!.height).toBeGreaterThan(830);
  expect(barBox!.y + barBox!.height).toBeLessThanOrEqual(845);
  const phone = await page.getByTestId('apply-phone').boundingBox();
  expect(phone!.y + phone!.height).toBeLessThanOrEqual(barBox!.y + 1);
  const footer = page.getByTestId('join-footer');
  await expect(footer).toContainText('© 2026 Legalgrads');
  await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms/');
  await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
  await expect(page.getByRole('heading', { name: 'Product' })).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const footerBox = await footer.boundingBox();
  const barAfter = await bar.boundingBox();
  expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(barAfter!.y + 1);
  await page.goto('/join/confirmation/');
  await expect(page.getByTestId('join-footer')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Product' })).toHaveCount(0);
  await expect(page.getByTestId('apply-actions')).toHaveCount(0);
});

test('application shows inline errors and the mobile step count', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await boot(page, '/join/');
  await page.getByTestId('apply-next').click();
  await expect(page.getByTestId('apply-name')).toBeFocused();
  await expect(page.getByTestId('apply-name')).toHaveAttribute('aria-invalid', 'true');
  await page.goto('/join/#license');
  await expect(page.getByTestId('step-count')).toHaveText('Step 2 of 5 · License');
  await expect(page.getByTestId('step-count')).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('progressbar', { name: 'Progress' })).toHaveAttribute('aria-valuenow', '2');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
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
  expect(terms).toMatch(/not a quality rating/i);
  expect(terms).toMatch(/not a benefit to clients/i);
  expect(terms).not.toMatch(/Early Attorney|Founding Member|first year|forever/i);
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  await expect(page.locator('main')).toContainText('messages are screened automatically for spam');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of Service');
  await expect(page.getByText('© 2026 Legalgrads. Informational resource only; not legal advice.')).toBeVisible();
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

test('cookie banner does not cover Continue', async ({ page }) => {
  function overlaps(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) {
    return a.x < b.x + b.width - 1 && a.x + a.width > b.x + 1 && a.y < b.y + b.height - 1 && a.y + a.height > b.y + 1;
  }
  for (const size of [
    { width: 390, height: 844 },
    { width: 1024, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    await page.goto('/join/#areas');
    await expect(page.getByTestId('cookie-banner')).toBeVisible();
    await expect(page.getByTestId('step-count')).toHaveText('Step 3 of 5 · Areas');
    const cookie = await page.getByTestId('cookie-banner').boundingBox();
    const bar = await page.getByTestId('apply-actions').boundingBox();
    const next = await page.getByTestId('apply-next').boundingBox();
    expect(cookie && bar && next).toBeTruthy();
    expect(overlaps(cookie!, bar!)).toBe(false);
    expect(overlaps(cookie!, next!)).toBe(false);
    await page.getByTestId('apply-next').click({ trial: true });
  }
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

test('CA calculator compares now vs Dec 1 and honors Fee Scaling rules', async ({ page }) => {
  await page.goto('/resources/post-bar-licensing-tracker/california/');
  const calc = page.getByTestId('swearing-in-calculator');
  await expect(calc.getByRole('heading', { name: 'Should I wait until December 1?' })).toBeVisible();
  await calc.getByRole('button', { name: 'Nov 20, 2026' }).click();
  await expect(page.getByTestId('compare-now')).toContainText('$897');
  await expect(page.getByTestId('compare-dec1')).toContainText('$598');
  await expect(page.getByTestId('compare-savings')).toContainText('Waiting 11 days saves $299');
  await page.getByTestId('fee-scaling').check();
  await expect(page.getByTestId('annual-amount')).toContainText('$460.25');
  await expect(page.getByTestId('relief-note')).toContainText('stays at $299');
  await page.getByTestId('fee-waiver').check();
  await expect(page.getByTestId('annual-amount')).toContainText('$323');
  await calc.getByRole('button', { name: 'Dec 1, 2026' }).click();
  await expect(page.getByTestId('cost-compare')).toHaveCount(0);
  await expect(page.getByTestId('calc-result')).toContainText('$0 first license fee');
  await expect(page.getByTestId('ics-download')).toBeVisible();
});
