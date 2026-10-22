# Legalgrads

Directory for newly licensed California attorneys. The public site is a static Next.js export. Attorney applications and the consumer waitlist are stored in Supabase when the project is configured. If it is not, the forms open an email to ryan@legalgrads.com with every field filled in, so a submission is never discarded in the browser.

Legalgrads is not a law firm. Listings go live only after a manual California State Bar check. The listing is free and shows the year the attorney joined, which is not a rating and not a benefit to clients. Legalgrads takes no referral fee and no share of legal fees. A later premium, if offered, would be a flat fee for extra visibility only.

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

CI builds without Supabase secrets, so the tests cover the email fallback and do not write real rows. `.github/workflows/pages.yml` passes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `npm run build` on every deploy. The publishable key (`sb_publishable_…`) is the value of `NEXT_PUBLIC_SUPABASE_ANON_KEY`. It is not committed.

## Supabase

1. Project URL: `https://qlhwojjdsonjxfeoiqww.supabase.co`.
2. In the SQL editor, paste the whole file `supabase/migrations/20261021120000_init.sql` and run it once. That file is the full schema: tables, row level security, `review_application`, message storage, and the private `attorney-photos` bucket policies.
3. If that init file was already pasted before private messages existed, do not paste it again. Paste `supabase/migrations/20261022013000_private_messages.sql` once, then paste `supabase/migrations/20261022023000_message_spam_screen.sql` once. If you already pasted the private-messages file, paste only the spam-screen file. Do not re-run `supabase/migrations/20261021233000_application_details.sql` after these.
4. Authentication → URL configuration:
   - Site URL: `https://legalgrads.com`
   - Redirect URLs: `https://legalgrads.com/attorney/profile/` and `http://localhost:3000/attorney/profile/`
5. Repository secrets already used by the Pages workflow:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the publishable key, not a secret key
   - `NEXT_PUBLIC_PHASE2` — leave unset until login, profile editing, admin review, and public profile pages should turn on. Set it to `1` when you want those routes active.
6. Do not add a secret or service-role key to the website or to a `NEXT_PUBLIC_` secret. Row Level Security is what keeps applications private.
7. Message relay uses two Edge Functions, `relay-attorney-message` and `inbound-attorney-reply`. Deploy them from `supabase/functions`. The website never receives an attorney email. Set these as function secrets, not repository `NEXT_PUBLIC_` secrets:
   - `RESEND_API_KEY` — required before a message is actually emailed. Create it in Resend.
   - `MESSAGE_FROM` — a verified sender, for example `Legalgrads <messages@legalgrads.com>`.
   - `INBOUND_EMAIL_DOMAIN` — the domain that receives `reply+<id>@` addresses, so a reply can be relayed without showing either address.
   - `INBOUND_WEBHOOK_SECRET` — a random string. Resend (or the inbound hook) must send it as `x-legalgrads-inbound-secret`.
   - `GEMINI_API_KEY` — a paid Gemini API key. The relay uses `gemini-2.5-flash-lite` to screen client messages before they are forwarded. About $0.04 per 1,000 typical messages ($0.10 per million input tokens and $0.40 per million output tokens). Use a billed key so Google does not use the text to improve its models. If this key is missing or the call fails, the message is still forwarded with the subject prefix `[Not screened]`.
   Without `RESEND_API_KEY`, the message is still stored and the attorney is not emailed yet. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already available inside Edge Functions. Spam is stored with `screen_status = quarantine` and is not emailed.
8. After you sign in once with ryan@legalgrads.com (phase 2), promote that user in the SQL editor:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'ryan@legalgrads.com';
```

There is no self-serve admin insert. The anon key can insert a pending application, a waitlist email, or a message to a published listing. It can read profiles where `published` is true. It cannot read attorney emails or stored messages.

Photos upload to the private `attorney-photos` bucket under `pending/`. They are not public. Move a file to `published/` if a live profile should show it.

`review_application(app_id, decision)` publishes or rejects. Only an admin can run it. Approving copies the application into `attorney_profiles` with `published = true`.

## GitHub Pages

`.github/workflows/pages.yml` builds `out/` and deploys it on every push to `main`. The build fails if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is empty, and it refuses a `sb_secret_` key. The custom domain file is `legalgrads.com`.

Pages has to be set to **GitHub Actions** in the repository settings before that workflow can publish.

## Phase 2

These routes exist and are not in the header or footer. They render “Not public yet” unless `NEXT_PUBLIC_PHASE2=1`:

- `/attorney/login/` — magic link
- `/attorney/profile/` — edit bio, cities, languages, rate, and contact link
- `/admin/review/` — approve after the State Bar check, or reject
- `/attorneys/profile/?id=` — public profile, a Joined year from the approval date, and a downloadable “I’m on Legalgrads” image

The find page already lists published profiles when the database has them. It shows “Attorneys joining now — launching soon” when it does not.
