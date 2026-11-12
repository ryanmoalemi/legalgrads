# Redesign route coverage (handoff step 1)

Compared the handoff's `route-inventory.json` (60,260 URLs and entry states, reviewed Nov 11, 2026) with the page definitions in `src/app`, the static generator `scripts/emit_profile_pages.py` and the Supabase email functions.

## Every inventoried family has a route in the repo

| Template | Inventory | Repo source |
| --- | --- | --- |
| T01 Home | 1 | `src/app/(site)/page.tsx` |
| T02 Search directory | 1 | `src/app/(site)/find-lawyer/page.tsx` |
| T03 Jurisdiction hub | 27 | `src/app/(site)/attorneys/[state]/page.tsx` |
| T04 City / office directory | 4,402 | `src/app/(site)/attorneys/[state]/[city]/page.tsx` |
| T05 Attorney profile | 55,688 | `scripts/emit_profile_pages.py` (static HTML). Next renders only the 2 noindex demo profiles |
| T06 For attorneys | 1 | `for-attorneys/page.tsx` |
| T07 Join | 1 | `join/page.tsx` |
| T08 Claim | 2 entry states | `claim/page.tsx` (`?profile=` and generic) |
| T10, T11 Practice areas | 1 + 8 | `specialties/page.tsx`, `specialties/[slug]/page.tsx` |
| T12 to T15 | 5 | `how-it-works`, `about`, `faq`, `pricing`, `free-listing-promise` |
| T16 to T18 Resources | 1 + 51 + 1 | `resources/post-bar-licensing-tracker/...` |
| T19 Embeds | 52 | `src/app/(embed)/embed/...` (national, California calculator, 50 states) |
| T20, T21 Legal | 1 + 11 | `legal`, `terms`, `privacy`, `attorney-terms`, `cookies`, `disclaimers`, `attorney-advertising`, `directory-disclosure`, `security`, `do-not-sell-or-share`, `accessibility`, `how-we-build-legalgrads` |
| T22 Support forms | 4 | `contact`, `privacy-request`, `report-abuse`, `data-deletion` |
| T23, T24 | 1 + 1 | `cookie-settings`, `sitemap` |

## Routes in the repo that the inventory does not list

| Route | What it is | Template to use |
| --- | --- | --- |
| `/404/` and `not-found.tsx` | Not-found page | T25 system states |
| `/attorney/login/` | Phase 2 magic-link sign in (`signInWithOtp`, no password). Shows a closed state unless `NEXT_PUBLIC_PHASE2=1`. Not linked from the header | T09 owner area |
| `/attorney/dashboard/` | Phase 2 owner dashboard, same flag | T09 owner area |
| `/attorney/profile/?profile=...` | Claimed-owner editor (`OwnerEditor.tsx`, code session from the claim). Without `?profile=` it is the Phase 2 editor | T09 owner area |
| `/admin/review/` | Moderation screen, same flag | T09 moderation |
| `/attorneys/profile/?id=` | Phase 2 public profile by id, noindex | T05 |
| `/attorneys/{state}/{city}/jordan-example-demo-unclaimed/` and `...-claimed/` | Fictional demo profiles, noindex | T05 (labeled examples only) |
| `/join/confirmation/` | Application submitted screen | T07 |
| `/referral-disclosure/` | Old URL, same document as `/directory-disclosure/`, canonical to it, noindex | T21 |
| Redirect stubs under `/attorneys/` | Written by `write_redirect()` for moved profile and hub URLs | No template (meta refresh) |

## Transactional email (T26), for a later phase

- `claim-notify`: "Your Legalgrads confirmation code" and "Your Legalgrads profile is claimed" (plain text, Resend).
- `owner-tools`: "New request from {name} via LegalGrads" (inquiry relay, reply-to the sender).
- `relay-attorney-message`, `inbound-attorney-reply`: relay mail through `_shared/mail.ts`.

No email copy, recipients, code expiry or delivery logic changes in this PR.
