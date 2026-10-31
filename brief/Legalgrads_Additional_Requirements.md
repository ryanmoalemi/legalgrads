# Legalgrads — Visual Assets, Legal Pages, Privacy & Compliance Addendum

This addendum is mandatory alongside `Legalgrads_Grok_Development_Spec.md`. Implement the existing eight mockups as the source of visual truth. This is a pitch demo, not an operational law firm, lawyer-referral service, or production payment platform.

## Included design references
- `mockups/legalgrads_page_1.png` through `mockups/legalgrads_page_8.png`: approved individual homepage, specialty selection, search, profile, how it works, attorney recruiting, mobile homepage, mobile search views.
- `references/approved_desktop.png`: approved two-line desktop hero, handwritten elements, overlapping attorney cards.
- `references/approved_mobile.png`: approved compact mobile hero and four benefit icons.
- `references/design_board.png`: eight-screen presentation board.
- `references/logo_reference.png`: image containing approved graduation-cap/column icon and Legalgrads wordmark. **This is a visual reference, not an editable vector logo.** Recreate clean SVG logo, wordmark, horizontal/stacked variants, dark/light variants and favicon from this reference. Do not present a raster crop as an original vector source.
- `assets/brand_tokens.json`: suggested implementation colors, gradients and layout tokens.

## Visual asset requirements
Create editable `logo.svg`, `logo-mark.svg`, `favicon.svg`, `logo-white.svg`, `og-image.png` (1200x630), social avatar, app icons (192/512), modern consistent specialty icons, check/verification icons, 4 benefit icons, hand-drawn arrow/scribble SVGs, gradient background ornaments, empty-state graphics, loading skeletons, and responsive attorney-card variants. Do not use third-party logos or press endorsements. Use mockup photos as *visual inspiration*, not as real attorneys; source licensed/consented stock or generate fictional demo headshots for implementation. Every person, institution, rate, review and bar credential displayed in seed profiles is labeled fictional demo data. Do not imply real bar approval.

## Required pages and routes
Public: `/`, `/find-lawyer`, `/specialties`, `/specialties/[slug]`, `/attorneys/[slug]`, `/how-it-works`, `/for-attorneys`, `/pricing` (explain platform fee model as proposed, no unsupported savings), `/about`, `/contact`, `/faq`, `/accessibility`, `/legal`, `/privacy`, `/terms`, `/cookies`, `/cookie-settings`, `/disclaimers`, `/attorney-advertising`, `/referral-disclosure`, `/security`, `/do-not-sell-or-share`, `/privacy-request`, `/data-deletion`, `/report-abuse`, `/404`.
Authenticated: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/client/dashboard`, `/client/requests`, `/client/messages`, `/client/appointments`, `/client/saved`, `/client/settings`, `/attorney/onboarding`, `/attorney/dashboard`, `/attorney/profile/edit`, `/attorney/leads`, `/attorney/matters`, `/attorney/messages`, `/attorney/calendar`, `/attorney/services`, `/attorney/settings`, `/notifications`.
System: consent manager, status/confirmation screens, conflict-check workflow, simulated engagement agreement, simulation of invoice/payment, simulated review flow, account deletion/export, report/complaint intake, audit/event log.

## Compliance pages and exact behavior
1. **Terms of Service:** draft separate client and attorney terms; user roles, eligibility, marketplace-only relationship, fees, permitted conduct, cancellations/refunds, disputes, intellectual property, suspension, governing law and changes. Explicitly state that terms are DRAFT and require legal counsel review. Version and timestamp acceptance; re-consent after material changes.
2. **Privacy Policy:** categories collected, purposes, sources, sharing, retention, security measures, cookies, rights, state-specific notices, contact, effective date and policy history. Avoid promising controls not implemented.
3. **Cookie Policy & Preferences:** strictly necessary cookies always on; analytics/marketing disabled until opt-in where required; banner with Accept, Reject Optional, Customize; persistent consent choices and ability to withdraw; no nonessential trackers loaded before consent.
4. **California privacy rights:** provide a working demo request form for access, correction, deletion, and opt-out of sale/sharing, with confirmation/status; assess CCPA/CPRA applicability and honor relevant jurisdictional requirements. Do not claim that every California privacy obligation automatically applies to the company.
5. **Attorney Advertising & Referral Disclosures:** clearly disclose whether listings are paid placements, sponsored, or ranked; explain how results are ordered. Do not claim certified lawyer-referral status. Have counsel review California lawyer-referral-service and fee-sharing rules and applicable rules in every operating state **before** launch. Avoid paid per-referral or fee percentage flows until cleared.
6. **No Legal Advice / No Attorney-Client Relationship:** Legalgrads is a platform, not a law firm. Browsing or sending a request does not establish representation; only a separately agreed attorney engagement does. Do not imply attorney-client privilege automatically covers initial marketplace submissions.
7. **License Verification:** display DEMO VERIFIED only for synthetic demo profiles. Production requires primary-source bar status and jurisdiction checks, disciplinary-status handling, periodic rechecks, and geographic/practice restrictions. A recent law graduate not admitted to a bar cannot offer independent legal representation.
8. **Conflicts, confidentiality, security:** avoid asking for sensitive details in initial discovery; use minimal intake; require attorney conflict review before engagement; role-based access; encrypt in transit and at rest; file upload scanning; retention/deletion; security event logging; never expose one client's matters to another.
9. **Payments:** mock checkout only, no real card fields; no real funds. Production payment and trust/IOLTA, escrow, refunds, chargebacks, platform fees and jurisdiction-specific fee-sharing need legal and payments-provider review.
10. **Reviews and testimonials:** seed reviews must say fictional demo data. In production, verified engagement reviews only, transparent moderation, no invented reviews or misleading ratings, clear disclosure of incentives.
11. **Accessibility:** WCAG 2.2 AA target, keyboard navigation, focus states, labels, contrast, reduced motion, screen-reader names, errors and responsive touch targets. Accessibility statement with contact channel; don't falsely certify compliance.
12. **Contact, complaints and safety:** working contact form, report attorney/profile, complaint ticket, abuse prevention, status acknowledgement; no invented company mailing address, phone, or regulator approval.
13. **Marketing claims:** no fake media logos, fabricated number of users, invented savings percentages, false testimonials, unsubstantiated attorney screening, or guaranteed outcomes.
14. **Data subject actions:** account data export and deletion flows work in demo; show confirmation, scoped deletion and retention exceptions. Distinguish demo implementation from production legal obligations.
15. **Age and jurisdiction:** restrict to adults for demo onboarding; capture state for practice matching; do not match out-of-jurisdiction attorneys for legal advice.

## Functional demo acceptance tests
- Each footer legal link opens a distinct complete draft page, not a blank placeholder.
- Cookie consent choice persists after reload; changing preferences changes which mock tracking events are permitted.
- Privacy request creates a ticket, appears in demo admin log, and can be completed or rejected with reason.
- Terms acceptance is required at account creation and records document version/date.
- Attorney sign-up with a not-yet-licensed status cannot publish a profile or accept independent legal matters.
- Client search filters by jurisdiction and specialty, showing only eligible, active, newly licensed attorney profiles.
- Client request generates attorney lead; attorney responds; client receives notification; conflict check precedes engagement.
- Message access is limited to participants, and demo reset restores synthetic records.
- All badges, reviews, prices, bar IDs and transactions carry a visible DEMO designation where necessary.
- No real payment, real email, or real personal data is required to complete partner walkthrough.

## Implementation and handoff
Build a real working responsive app with reusable components, seeded DB, migration scripts, README, environment template, one-command run, demo accounts, role switcher, reset button, tests and a partner demo walkthrough. No static-only mockup implementation. The visual reference images are not source code; recreate their UI with semantic HTML, CSS, SVG and responsive layouts. Any missing imagery must be generated or licensed before production.

**Legal review gate:** All policy copy and attorney-marketplace structures are illustrative, not legal advice or legally approved policies. Production launch requires licensed counsel review of marketplace classification, advertising/referral compensation, bar rules, privacy/security and payment handling.
