# LegalGrads California pilot: unclaimed starter listings (draft, Oct 27, 2026)

## Findings
1. **Attorney profiles are public, but email usually isn't.** Each profile (https://apps.calbar.ca.gov/attorney/Licensee/Detail/{bar#}) shows name, bar #, status, address, phone, email *if the lawyer opted to publish it* (shows "Not Available" otherwise), website, self-reported practice areas, languages, law school, and the admission date in the status history. State Bar Rule 2.2 (https://www.calbar.ca.gov/legal-professionals/rules/rules-state-bar/title-2-rights-and-responsibilities-licensees/division-1-licensee-record) makes these fields presumptively public, except the non-public email and trust account info. Bar numbers are assigned in order, so recent admits fall in a block: #365000–365025 were admitted Nov 26–Dec 4, 2025. Quick search has no "admitted after" filter.
2. **Bulk data:** the State Bar says it "does not sell licensee information" (privacy policy: https://www.calbar.ca.gov/privacy-policy). Bulk data can be requested under the Public Records Act through https://calbarca.nextrequest.com/ (10-day response, 10¢/page plus data-extraction costs). Under B&P §6001(d), lawyers can opt out of non-regulatory disclosure, but the Bar says that opt-out doesn't affect what the Public Records Act requires it to disclose. **Best route: a Public Records Act request for "name, bar #, admit date, status, public address, law school for all licensees admitted on or after 1/1/2025" as a CSV.**
3. **robots.txt** (apps.calbar.ca.gov) blocks only /apollo, /cbe/docs and /ra/. Attorney search pages aren't blocked. I didn't find a separate terms-of-use page that forbids automated access. Even so, keep requests slow, or use the Public Records Act route instead of scraping.
4. **Pass lists:** the Bar posts a public, name-searchable pass list at https://apps.calbar.ca.gov/exam/default.aspx. The July 2026 list goes public **Mon Nov 2, 2026, 8:00 a.m. PT** (applicants see results Oct 30). Passing isn't the same as being licensed: passers still need moral character approval, the MPRE, the oath and the Supreme Court motion. **Only list people once they show "Active" on the attorney search.**
5. **Volume (official):** February 2026 had 1,211 General Bar Exam passers plus 272 Attorneys' Exam passers (https://www.calbar.ca.gov/news/state-bar-announces-february-2026-bar-exam-results). The July exam is usually the bigger one, so expect roughly 4,000–6,000 new California admits a year. That's an estimate. Confirm it with the July 2026 numbers on Nov 2.

## Legal risks
- **B&P §6155 / Jackson v. LegalMatch (2019, Cal. Ct. App. A152442, https://cases.justia.com/california/court-of-appeal/2019-a152442.pdf):** the court held that LegalMatch WAS an uncertified lawyer referral service. A "referral" happens whenever a service routes potential clients to lawyers by location and practice area, even with no legal judgment involved. **Big risk:** if LegalGrads matches or sends client inquiries to lawyers (an intake form, "get matched"), it can fall under §6155 and need State Bar certification. To stay a directory, let users browse and contact lawyers directly, with no matching or routing. That's safest if lawyers also don't pay per lead. Get a California ethics opinion before adding matching or paid tiers.
- **Right of publicity (Civ. Code §3344):** it bars using a name or likeness "on or in products... or for purposes of advertising" without consent. Listing factual public records is generally defensible. Using a name in ads, or implying the lawyer endorses LegalGrads, is risky. Rules: no photos scraped from elsewhere, a clear "Unclaimed: info from public State Bar records" label, no fake endorsements, and one-click removal.
- **Browne v. Avvo (W.D. Wash. 2007, 525 F. Supp. 2d 1249):** dismissed on First Amendment grounds, but the suit was about Avvo's *ratings*, not about having profiles. Lesson: don't rate or rank unclaimed lawyers.
- **CCPA/CPRA:** "personal information" excludes "publicly available" information lawfully obtained from government records (Civ. Code §1798.140(v)(2)). The exemption may not apply if the data is used in ways unrelated to why the government made it available, so still honor deletion and opt-out requests. LegalGrads may be under the CCPA size thresholds anyway, but this is good practice.
- **Lawyer advertising (CA Rules 7.1–7.3):** these bind the lawyers. An unclaimed profile shouldn't say "available" or "affordable" on the lawyer's behalf.

## Recommended pipeline
1. File a Public Records Act request (NextRequest) for licensees admitted 2025 to date. Repeat it each quarter.
2. Meanwhile, or as a backup, do a polite incremental crawl from the newest known bar number upward (1 request every 1.5–2 s, stop at a run of misses). Store only bar #, name, status, admit date, city/state, law school and profile URL.
3. Filter to Active status with an admit date of 2025 or later.
4. Publish minimal unclaimed listings with a "last verified" date, a no-affiliation/no-endorsement notice, and a "self-reported, not a certified specialist" note on any practice areas (name, city, law school, admit year, link to the State Bar profile), noindex until claimed if you want to be cautious. No phone, no photo.
5. Claim flow: the lawyer verifies with a code mailed to the office address on their State Bar record, an email to a *publicly listed* State Bar email, or a file/DNS check on the website on their record. (The State Bar email on file is non-public, so we can't use it.) Then they add a photo, services and a bio. Remove on request within 48 h.
6. Re-check status monthly and drop anyone who becomes inactive or suspended.

## Outreach (emails mostly not public)
- Public email/website on the bar record when the lawyer published it (a minority).
- Office address on the record: mailed postcard "claim your free profile" (CAN-SPAM doesn't apply to mail).
- LinkedIn: search "Attorney" + "admitted Dec 2025" / law school; send connection notes by hand (respect LinkedIn's terms, no automation).
- Law school career and alumni offices: offer a free "new grad" listing as a career resource; they can forward it to recent grads.
- Swearing-in season: time outreach for early December and early June, after each Supreme Court admission motion.
- Cold email to published addresses: CAN-SPAM requires a physical address and an opt-out.

## Sample
/workspace/legalgrads/data/ca-sample.csv: 25 rows, bar #365001–365025, all Active, admitted 11/26–12/4/2025 (public fields only; collected with 25 requests at 1.5 s spacing).

## Next steps
1. Ryan/Scott: file the Public Records Act request (draft text above).
2. Scott: call the State Bar ethics hotline about §6155 before any matching feature.
3. Website Builder: add an "Unclaimed" profile template, a claim flow and a removal form.
4. Nov 2: note the July 2026 passer count; their admissions arrive around Dec 2026.

## GPT and Gemini input
- **GPT (gpt-5, raw: ai-reviews/openai-raw.json, openai.md):** agreed on the §6155/LegalMatch risk, minimal unclaimed profiles, noindex and preferring the Public Records Act route. It added: link out with mailto/tel instead of routing contact forms; disclaimers on self-reported practice areas; "last verified" dates to avoid stale-status (false light) risk; stronger claim verification; and California's anti-spam law, B&P §17529.5, for email outreach.
  - **Changed:** the claim flow (my draft wrongly relied on the non-public State Bar email), disclaimers, and last-verified dates.
  - **Not adopted / unverified:** GPT says the CCPA "publicly available" exclusion isn't purpose-limited and that electronic Public Records Act copies are cost-based rather than 10¢/page (it cited old Gov. Code §6253.9, which has since been renumbered). I couldn't confirm either from the statute text this session, so the plan keeps the cautious wording. Its point that bar numbers aren't a perfect proxy for admit date is fair. The sample shows they are close (all 25 admitted within 9 days), but always filter on the actual admit date.
- **Gemini:** no review. gemini-3.1-pro-preview returned 429 "exceeded your current quota", and gemini-2.5-pro returns "no longer available to new users". Fix the Gemini API billing/quota and re-run.
