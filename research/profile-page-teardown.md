# Lawyer profile page teardown (Oct 27, 2026)

Real profiles reviewed (San Diego business lawyers). Method: curl + web search snapshots. Avvo, Justia, Super Lawyers and Lawyers.com return Cloudflare 403 to curl, so I read them from search-index snapshots. LegalZoom and Rocket Lawyer don't publish public per-attorney profiles (their lawyers sit behind plans), so they're left out. Google Business Profile was skipped because it's an app panel, not a page.

| # | Site | Example | Above the fold | Trust signals | Contact/CTA | Unclaimed handling | SEO / schema |
|---|---|---|---|---|---|---|---|
| 1 | Avvo | avvo.com/attorneys/92101-ca-antonio-maldonado-321600.html | Name, PRO badge, stars + Avvo Rating 10.0, "Licensed for 23 years", practice areas, address | License block per state: year acquired, Active, **"No misconduct found"** | Sticky "Call for a consultation" + Message, Website | Auto-built from bar data, shows a rating even with 0 reviews ("Not yet reviewed… Rating 8.0") | Title "Name Profile - City, ST Corporate Lawyer"; URL has ZIP+state |
| 2 | Justia | lawyers.justia.com/lawyer/namita-thakker-1675877 | Phone bar "Free Consultation / Tap to call", name, state, practice areas, years | **"Claimed Lawyer Profile" badge**, bar # under Jurisdictions, education, languages | Phone, Email, Website, Contact & Map at bottom | **"Brandee, click here to claim your profile for free!"** inline under name | Title "Name, Lawyer in City, State \| Justia Lawyer Directory" |
| 3 | Martindale-Hubbell | martindale.com/attorney/susan-d-white-212800/ | Name, firm, address, Overall Rating + peer/client/Avvo review split | AV Preeminent peer rating | Phone, Get directions | Profiles exist for all lawyers, ads sell visibility | Person + LegalService + AggregateRating + BreadcrumbList JSON-LD |
| 4 | Lawyers.com | (403; same Internet Brands data as Martindale/Avvo) | Mirrors Martindale | Ratings | Phone | Same as Martindale | Same family |
| 5 | FindLaw | lawyers.findlaw.com/california/san-diego/4161569_1/ | Name, firm, practice area, city | Firm-level, few individual signals | Phone / website (paid listings first) | Basic free listing | Title "Name - a City, State (ST) Business Law Lawyer"; LegalService + Person + Offer + BreadcrumbList |
| 6 | Super Lawyers | profiles.superlawyers.com/california/san-diego/lawyer/jason-s-miller/... | Name, "Top rated Business & Corporate attorney in San Diego", firm | "Licensed in California since", education, languages, **Rising Stars** years | Firm address / map | Only selected lawyers get a profile | City in URL path |
| 7 | UpCounsel | upcounsel.com/profile/karenbraveheart | Photo, headline "Premier Business and Contract Attorney", city, "Licensed in NY", law school | Review subscores (communication, response time…), **repeat clients, projects, response time**, "verified" | Post a job → proposals (platform-mediated, matching) | Vetted only | Minimal |
| 8 | ContractsCounsel | contractscounsel.com/attorney/profile/... | Photo, name, bar states, rating | Reviews, projects | Get a bid (matching marketplace) | Vetted only | Title generic |
| 9 | Thumbtack | thumbtack.com/.../ruscrane-law-firm/service/... | Business name, stars, **# hires**, "Request estimate" | Reviews, hires, background check | Sticky request-a-quote | n/a | LocalBusiness + AggregateRating + Review JSON-LD |
| 10 | Avvo/Justia "unclaimed" shared pattern | — | Name + public license data only | License status | Claim CTA | — | — |

## Patterns to steal (ranked)
1. **License block as the hero trust signal** (Avvo): state, admitted date, "Active", "No public discipline found", with a link to the official bar record. For new grads this replaces "years of experience".
2. **Inline "Is this you? Claim your free profile" under the name** (Justia), plus a separate "Claimed profile" badge once claimed.
3. **One-line hero summary**: name → headline ("Business & contracts attorney in San Diego, CA") → 3 chips (location, admitted year, languages) (Super Lawyers / Justia).
4. **Sticky primary contact CTA**, a mobile bottom bar (Avvo/Justia "Tap to call"). Ours is "Contact directly / Visit website".
5. **Services as concrete tasks with plain descriptions** (Avvo practice-area blurbs), not legalese categories. Ours stay outside-court only.
6. **Facts list**: education, languages, jurisdictions, bar # (Justia sidebar).
7. **Responsiveness signals without ratings** (UpCounsel "response time"), shown only when self-reported and labeled as such. Optional later.
8. **SEO**: title "Name, Business Attorney in City, ST | LegalGrads"; URL /attorneys/ca/san-diego/first-last-<bar#>/; JSON-LD Person (jobTitle Attorney) + LegalService (Attorney type), BreadcrumbList; no AggregateRating until real reviews exist.
9. **Breadcrumbs** Home › California › San Diego › Business (all sites). Free internal linking.
10. **"Last verified" date + data source** (implied by Avvo's license block). We make it explicit.

## Avoid
- **Ratings/scores on unclaimed or unreviewed profiles** (Avvo shows "Rating 8.0" with zero reviews, and it's the #1 lawyer complaint and the Browne v. Avvo issue).
- **Pay-to-rank / "PRO" or "Premium" placement mixed into results** (Avvo PRO, Justia Premium, FindLaw). It conflicts with "no endorsement" and CA referral-service rules (Bus. & Prof. Code §6155).
- **Platform matching / "post a job, get proposals"** (UpCounsel, ContractsCounsel, Thumbtack). That's referral-service territory in CA, so stay browse-only.
- **"Top rated", "Best", "Super", "Preeminent" superlatives.** CA Rule 7.1 misleading-communication risk.
- **Competitor ads on a lawyer's own profile** ("Sponsored nearby lawyers"). It annoys lawyers we want to claim.
- **Showing hourly rates** for now (product decision; no booking/payments yet).
