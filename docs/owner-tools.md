# Owner tools for claimed profiles

Claimed attorneys get a phone-friendly editor (`/attorney/profile/?profile=...`), a private stats page (`/attorney/dashboard/?profile=...`), and an optional request form on their public profile.

## Pieces

- `supabase/migrations/20261111090000_owner_profile_tools.sql`: new profile fields on `profile_owner_edits`, plus `profile_events` and `profile_inquiries`. RLS is on for both new tables with no policies. Anonymous visitors can only call `record_profile_event(path, kind)`.
- `supabase/functions/owner-tools`: `public`, `save`, `dashboard`, and `inquiry` actions. Sign-in is the claim token that `claim-notify` issues after the email code. Deploy with `supabase functions deploy owner-tools --no-verify-jwt`.
- `public/js/owner-edits.js`: renders the claimed fields on static profile pages, shows the request form for verified claims, and records views, website taps, and phone taps. It skips bots, automated browsers, and the owner's own device.

## Request delivery

Requests are emailed to the claim's verified address from `LegalGrads <ryan@legalgrads.com>` (override with the `INQUIRY_FROM` secret), with the sender as reply-to. The message text is not stored. A delivery row (status, profile, hashed sender and network address) is kept for 90 days for counts and rate limits.

Delivery to real attorneys stays off until the `INQUIRY_MAIL_LIVE` secret is `1`. Until then only the test inboxes (`ryan@legalgrads.com`, `aftermarketproducts71@gmail.com`, `*@resend.dev`) receive requests. For everyone else the `public` action reports the form as off, so it is not shown.

Spam protection: a hidden honeypot field, a 3 second minimum fill time, link and keyword prechecks, and limits of 5 requests per network per hour, 5 per sender per day, and 30 per profile per day.
