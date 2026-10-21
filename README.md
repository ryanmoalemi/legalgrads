# Legalgrads pitch demo

Interactive pitch demo for [legalgrads.com](https://legalgrads.com). Every attorney, client, review, rate, verification, and payment is fictional. A persistent banner reads **Interactive demo, fictional data**.

This is not a law firm, not attorney advertising for a real lawyer, and not a launch-ready compliance program. The legal pages are labeled **DRAFT**. The legal entity name on those pages is **Legalgrads**. The public contact address is **ryan@legalgrads.com**.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build (static export, no `basePath`, GitHub Pages):

```bash
npm run build
npx serve out
```

The demo needs no environment variables. Copy `.env.example` only when you move off the static demo.

## Tests

```bash
npm run test:seed          # seed invariants
npx playwright install --with-deps chromium
npm run build
npm test                   # acceptance tests 1–15 and the addendum
```

`npm test` serves the `out/` directory and runs Playwright. CI does the same (`.github/workflows/ci.yml`).

Acceptance test 12 (data survives refresh) passes because the data layer writes the whole database **synchronously to `localStorage` (`legalgrads-db`)** and mirrors it to **IndexedDB** (`legalgrads-demo` / store `kv` / key `state`). A full navigation reads `localStorage` first. There is no server round-trip. Reset Demo restores the seed in both stores.

## Demo accounts

Password for every account: `demo1234`.

| Role | Email | Notes |
| --- | --- | --- |
| Client | casey@demo.legalgrads.test | Walkthrough client, linked to Maya |
| Client | sam@demo.legalgrads.test | Second client. Cannot read Casey’s inquiries |
| Attorney | maya@demo.legalgrads.test | “Switch to Attorney” always opens Maya |
| Admin | admin@demo.legalgrads.test | Verification queue, privacy tickets, terms version |

The sticky demo bar can switch Client / Attorney / Admin or pick any seeded user, including Kevin (verification pending), Ryan P. (not admitted), and Daniel (outside the eligibility window). **Reset Demo** restores the seed. The demo clock is fixed at October 21, 2026.

No real email is sent. No card number is collected. Payments are a checkbox labeled “Demo payment — no money charged” and are stored with `simulated: true`. Verification badges say simulated and do not include a bar number. Reviews are labeled fictional demo reviews. Nicole is bookable and has zero reviews.

## Partner walkthrough (about five minutes)

1. Homepage: “Fresh out of law school. Ready to work for you.” Choose **Contracts**. Continue through intake. Matching attorneys include Maya and exclude Jordan, Kevin, Daniel, and Ryan P.
2. Open Maya R. Confirm the fictional portrait, simulated verification, and DEMO label. Request a consultation.
3. **Switch to Attorney**. The lead is on Maya’s dashboard. Clear the conflict, send a proposal, propose a slot.
4. **Switch to Client**. Confirm the slot. Accept the proposal only after checking the demo-payment box. An active matter appears for both roles.
5. **Switch to Attorney**. Complete the matter.
6. **Switch to Client**. Post a review. It appears on Maya’s profile as a fictional demo review.
7. **Switch to Admin**. A not-yet-admitted attorney cannot publish. Privacy requests are ticketed and can be completed or rejected with a reason.
8. Resize to 375px. The homepage still shows four benefit icons and does not scroll sideways. The hamburger opens Find a Lawyer.

## Brand

Colors: navy `#0B0B3B`, purple `#7A00FF`, pink `#FF008A`, orange `#FF6B22`, cream `#FFF8F1`, mint `#00C5A2`.

Type: Plus Jakarta Sans (800 headings, 600 UI), Inter (400/500 body), Caveat (600/700 handwritten). These are the Google Fonts families, self-hosted with `@fontsource` so the page does not call Google before cookie consent.

Logos in `public/logos/` (`legalgrads_horizontal.svg`, `legalgrads_mark.svg`, `legalgrads_wordmark.svg`) plus white and dark variants. The header uses the mark with a live wordmark. Favicon is the mark. `public/icons/icon-192.png`, `icon-512.png`, and `public/og-image.png` (1200×630) are derived from the mark. Specialty and benefit icons are the supplied SVGs. Headshots `01_maya` through `12_nicole` map to the twelve seeded attorneys by first name and are labeled fictional. Replace them before any production use. `brand_reference.png` was visual reference only and is not shipped as a page asset.

## Moving off the demo

The static export cannot run a database, middleware, or server actions. `prisma/schema.prisma` matches the demo records (SQLite provider). `src/lib/sqlite-adapter.ts` throws on purpose.

To use a real server:

1. `npm install prisma @prisma/client`
2. Set `DATABASE_URL` (SQLite file or change the Prisma provider to Postgres).
3. `npx prisma migrate dev` and seed from `buildSeed()` in `src/lib/seed.ts`.
4. Replace `src/lib/db.ts` with server routes that use Prisma. Keep the same authorization: a client can read only their own inquiries, messages, matters, and reviews. Do not trust the browser.
5. Replace the demo password hash, the role switcher, and the on-page reset token. Send real mail only after the legal drafts are replaced.
6. Bump `SEED_VERSION` when the seed shape changes so old browser snapshots are discarded.

## GitHub Pages

`CNAME` is `legalgrads.com` (repo root and `public/CNAME`, which the export copies into `out/`).

`.github/workflows/pages.yml` builds the static export and deploys the `out/` artifact with GitHub Pages Actions on every push to `main`, and on `workflow_dispatch`.

Before that workflow can update the live site:

1. Merge this branch to `main`.
2. In the repo Settings → Pages, set the source to **GitHub Actions** (not “Deploy from a branch”). Deploying the old root `index.html` and this app at the same time will not work. The coming-soon page is removed in this branch.
3. Confirm the custom domain is still `legalgrads.com`.

Until that merge and Pages source change, https://legalgrads.com keeps serving the previous coming-soon page.

## What is simulated

Email delivery, bar verification, video meeting links, card payments, and password-reset delivery. The reset token is shown on the page. Cookie analytics is an in-browser log and only records after that channel is opted in. No third-party scripts. No press logos. No savings-percentage claims. No real personal data is required.
