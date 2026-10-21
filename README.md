# Legalgrads

Directory for newly licensed California attorneys. The public site is a static Next.js export. Attorney applications and the consumer waitlist are stored in Supabase when the project is configured. If it is not, the forms open an email to ryan@legalgrads.com with every field filled in, so a submission is never discarded in the browser.

Legalgrads is not a law firm. Listings go live only after a manual California State Bar check. Founding listings are free. Legalgrads takes no referral fee and no share of legal fees. A later premium, if offered, would be a flat fee for extra visibility only.

Policies are marked “Draft — pending legal review” in the footer.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
npx serve out
```

## Tests

```bash
npx playwright install --with-deps chromium
npm run build
npm test
```

CI builds without Supabase secrets, so the tests cover the email fallback. The GitHub Pages workflow bakes secrets in at build time.

## Supabase

1. Create a Supabase project.
2. In the SQL editor, run `supabase/migrations/20261021120000_init.sql`.
3. Authentication → URL configuration:
   - Site URL: `https://legalgrads.com`
   - Redirect URLs: `https://legalgrads.com/attorney/profile/` and `http://localhost:3000/attorney/profile/`
4. Add repository secrets (Settings → Secrets and variables → Actions):
   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key only
   - `NEXT_PUBLIC_PHASE2` — leave unset until login, profile editing, admin review, and public profile pages should be linked. Set it to `1` when you want those routes active.
5. Do not add the service-role key to the website or to a `NEXT_PUBLIC_` secret. Row Level Security is what keeps applications private.
6. After you sign in once with ryan@legalgrads.com (phase 2), promote that user in the SQL editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'ryan@legalgrads.com';
```

There is no self-serve admin insert. The anon key can only insert a pending application or a waitlist email, and can only read profiles where `published` is true.

Photos upload to the private `attorney-photos` bucket under `pending/`. They are not public. Move a file to `published/` if a live profile should show it.

`review_application(app_id, decision)` publishes or rejects. Only an admin can run it. Approving copies the application into `attorney_profiles` with `published = true`.

## GitHub Pages

`.github/workflows/pages.yml` builds `out/` and deploys it on every push to `main`. The custom domain file is `legalgrads.com`.

Pages has to be set to **GitHub Actions** in the repository settings before that workflow can publish. Until the two Supabase secrets exist, the live build uses the email fallback.

## Phase 2

These routes exist and are not in the header or footer. They render “Not public yet” unless `NEXT_PUBLIC_PHASE2=1`:

- `/attorney/login/` — magic link
- `/attorney/profile/` — edit bio, cities, languages, rate, and contact link
- `/admin/review/` — approve after the State Bar check, or reject
- `/attorneys/profile/?id=` — public profile, Founding Member badge, and a downloadable “I’m on Legalgrads” image

The find page already lists published profiles when the database has them. It shows “Founding attorneys joining now — launching soon” when it does not.
