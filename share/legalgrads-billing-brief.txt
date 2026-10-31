# LegalGrads Billing Brief (for ChatGPT / Gemini)

## 1. What LegalGrads is
LegalGrads (https://legalgrads.com) is a nationwide US directory where newly licensed attorneys list themselves for free and small business owners who can't afford big firms find and hire them. Attorneys sign up at https://legalgrads.com/join/. Next step: let clients **book and pay lawyers by the hour on the site**, Fiverr-style. **Hourly only, no retainers ever:** the client approves the lawyer's logged hours, then is charged. Those are earned fees and go to the lawyer's operating account, so no trust/IOLTA account is involved. **Outside-court work only at launch** (contracts, reviews, letters, advice, drafting), with no court appearances or counsel-of-record work, so a lawyer is never stuck on a case unpaid. The client pays the lawyer's fee **plus a separate LegalGrads service fee** at checkout. The lawyer is paid into **their own account** and keeps their full fee. Founders: Ryan (business) and Scott (San Diego attorney). We may also take a percentage of the lawyer's fee. We understand the fee-sharing risk and have accepted it.

## 2. Goal
Pick the billing stack that can (a) onboard and verify lawyers in all 50 states, (b) take client card/ACH payments, (c) pay lawyers directly, (d) collect our fee, (e) handle refunds, chargebacks and 1099-Ks, and (f) be built by a tiny team.

## Scope: outside court only
- **Why:** Once a lawyer appears in court, withdrawing usually needs the court's permission, even if the client stops paying ([ABA Model Rule 1.16(c)](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_16_declining_or_terminating_representation/)). Outside-court tasks have no such lock-in.
- **Limited-scope representation:** Each booking is limited in scope, which is allowed if reasonable and the client gives informed consent ([Rule 1.2(c)](https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct/rule_1_2_scope_of_representation_allocation_of_authority_between_client_lawyer/)). That consent goes in a **task-specific e-signed engagement letter** (e.g., "review one lease, up to 2 hrs").
- **Clean ending:** At the end of each booking, a wrap-up message to the client states the task is done and the lawyer's role has ended. Any new work needs a new booking and letter.
- **Later:** Court work (e.g., traffic tickets) may come later with **prepaid flat fees** and **limited-scope appearance forms** where states allow them. Prepaid fees would bring back trust-account rules.

## 3. Comparison (published list prices, checked Oct 2026)
| Option | What it is | Marketplace split / platform fee? | Trust (IOLTA) handling | Price |
|---|---|---|---|---|
| **Stripe Connect** ([pricing](https://stripe.com/connect/pricing)) | Marketplace payments API. Express/Custom accounts, application fees, destination or separate charges + transfers | Yes, built for it | Not legal-specific. Lawyer can link any bank, but nothing stops a payout or fee from hitting trust | 2.9% + $0.30 card ([stripe.com/pricing](https://stripe.com/pricing)). If platform sets pricing: $2/active account/mo + 0.25% + $0.25 per payout. 1099: $2.99 per IRS e-file |
| **LawPay** ([pricing](https://www.lawpay.com/pricing/)) | Legal payment processor, per-firm merchant account | No native marketplace split. Partner API exists ([help](https://help.lawpay.com/en/articles/10671852-integrations-settings-overview), [dev docs](https://developers.8am.com/)), and partnership is by application | Strong: separate trust/operating, full deposit to trust, fees debited from operating, no trust debits even for chargebacks ([compliance](https://www.lawpay.com/features/compliance/)) | $19/firm/mo. 2.99% + $0.30 V/MC/D, 3.90% + $0.30 Amex, 1% eCheck, plus card-brand pass-throughs |
| **Clio Payments** ([features](https://www.clio.com/features/payments/)) | Built into Clio Manage | No. Each lawyer's own Clio account | Strong: fees only from operating ([ACH FAQ](https://www.clio.com/web/bank-transfers-in-clio-payments/)) | 2.95% cards, 3.5% Amex for LawPay switchers, 1% ACH ([compare](https://www.clio.com/compare/clio-vs-lawpay-integration/)). Needs a Clio subscription |
| **Confido Legal** ([pricing](https://confidolegal.com/pricing)) | Legal payments with partner integrations | No marketplace split listed. Integrates "through partners" | Split trust/operating, "fees routed to comply" | 2.95% card, 1% ACH (cap $30), $3/disbursement, $25 chargeback. $500 onboarding unless via a partner |
| **Headnote** ([pricing](https://headnote.com/pricing/)) | Legal AR/payments | No | Legal-focused | 2.9% card, 1.9% instant eCheck, no monthly fee |
| **PayPal / Braintree Marketplace** | Older marketplace product | Yes, historically. **Verify it is still open to new US platforms** before considering | Not legal-specific | Not verified. Ask PayPal |
| **Adyen for Platforms** | Enterprise marketplace payments | Yes | Not legal-specific | Negotiated minimum invoice + per-transaction fees ([Sharetribe summary](https://www.sharetribe.com/academy/marketplace-payments/adyen-for-platforms-overview/)). Overkill at our stage |
| **Sharetribe** ([pricing](https://www.sharetribe.com/pricing)) | No-code/low-code marketplace builder on Stripe Connect | Yes (commission built in) | Same as Stripe | Plans from about $39/mo (Build) and $199–259/mo (Live), plus Stripe fees ([changelog](https://www.sharetribe.com/pricing/pricing-changelog/)) |

**Booking / time / signing add-ons:** Cal.com or Calendly for booking hourly slots (both support Stripe-paid bookings, so confirm the current plan). Time logging and approval can be built in our app, or lawyers can use Clio/LawPay time tracking. E-signing engagement letters can use Dropbox Sign, DocuSign or a built-in e-sign API, signed before the first paid hour.

## 4. Example economics ($300/hr × 2 hrs, 10% client fee, Stripe Connect, US card)
- Lawyer fee: $600. LegalGrads client fee: $60. Client pays **$660**.
- Card processing (2.9% + $0.30 on $660): **$19.44**
- Payout to lawyer (0.25% + $0.25 on $600): **$1.75**. Active-account fee: **$2.00/mo** per lawyer paid that month.
- If LegalGrads absorbs all Stripe costs: lawyer gets **$600** and LegalGrads nets about **$36.81** (before the 1099 at $2.99/yr per lawyer). With ACH and a lower processing cost, the net is higher.
- If we also take a % of the lawyer's fee, that is fee sharing (see risks).

## 5. Recommended stack
**Stripe Connect (Express accounts) + in-app booking/time log with client approval + an e-signed engagement letter.**
Why: Stripe is the only option here that natively handles marketplace onboarding/KYC, split payments, platform fees, refunds/disputes and 1099-K filing. The legal processors (LawPay, Clio, Confido) mainly add trust accounting, which we don't need because the client is only ever charged for hours already worked and approved. The LegalGrads fee is a **separate line paid by the client**, not deducted from the lawyer's fee. Consider Sharetribe only if we want to skip custom code.

## 6. Money flow (in words)
1. Client books a slot and e-signs the lawyer's engagement letter (hourly rate, billing increment, and LegalGrads' separate client-paid fee).
2. Lawyer does the work and logs 2.0 hrs. The client approves, or disputes within a set window.
3. Stripe charges the client $660: $600 is a **destination charge** to the lawyer's Connect account, with $60 kept as an **application fee**. (Alternative: two separate charges, so the legal fee never touches our balance.)
4. Stripe pays $600 to the lawyer's **operating** bank account. Nothing is prepaid, so nothing is held in trust. LegalGrads keeps $60 minus Stripe costs.
5. Refunds/chargebacks: with destination charges the platform is liable by default, so we recover from lawyers by contract.
6. Year end: Stripe issues 1099-Ks to lawyers who meet the IRS threshold. Verify the current threshold at [irs.gov](https://www.irs.gov/businesses/understanding-your-form-1099-k).

## 7. Open risks (facts, not lectures)
- **Fee sharing / referral fees:** NJ barred lawyers from Avvo Legal Services because its per-matter "marketing fee" was fee sharing (Rule 5.4(a)) and an improper referral payment (7.2), and because a nonlawyer held client funds ([NJ Joint Op. 732/44/54](https://www.njcourts.gov/sites/default/files/notices/2017/06/n170621f.pdf)). Ohio ([Op. 2016-3](https://www.ohioadvop.org/wp-content/uploads/2017/04/Op_16-003.pdf)) and PA (Formal Op. 2016-200, [ISBA list](https://www.isba.org/committees/futurelegalservices/resources)) and SC reached similar results. Avvo ended the program in 2018. The rule binds **each listed lawyer** in their own state.
- **Why no trust account:** ABA [Formal Op. 465](https://lalegalethics.org/wp-content/uploads/2013-10-21-ABA-Formal-Opinion-re-Groupon-Advertising.pdf) (deal sites) says prepaid deal money is an advance fee and goes in trust, and a marketer's cut must be reasonable advertising/processing cost. State card-processing opinions (e.g., [Oregon 2005-172](https://www.osbar.org/_docs/ethics/2005-172.pdf), [Michigan RI-344](https://www.michbar.org/opinions/ethics/numbered_opinions/RI-344)) say processing fees and chargebacks must not be taken from client trust funds. Charging only after hours are approved keeps every payment an earned fee, which sidesteps these rules. Any prepayment would make it an advance fee that belongs in trust. Note: ABA Formal Op. **482** is about disasters, not credit cards.
- **California:** lawyer referral service certification rules (Bus. & Prof. Code §6155) and the uninsured-lawyer disclosure (Rule 1.4.2).
- **Liability:** platform chargeback liability under destination charges, refund policy when a client disputes hours, and money-transmitter questions if we hold funds (Stripe Connect is designed to cover this, so confirm).
- **Unverified items:** current Braintree Marketplace availability, the 1099-K threshold for 2026, and Cal.com/Calendly plan details.

## 8. Questions for the AIs
1. Destination charges with an application fee, or two separate charges (lawyer fee direct to the lawyer, our fee to us)? Which is cleaner for Rule 5.4, and why?
2. Can a client-paid service fee (not deducted from the lawyer) avoid fee sharing in NJ, OH, PA, SC and CA? Cite opinions.
3. Pay-after vs. saving a card at booking with a pre-authorization hold: does a hold (not a capture) count as an advance fee under trust rules? How long can a Stripe hold last?
4. How should disputes over logged hours work (approval window, auto-approve, partial approval, who mediates), and what refund/chargeback terms protect the platform under destination charges?
5. Minimum billing increment (0.1 vs. 0.25 hr) and minimum booking length: what's standard, and how do we show it at checkout?
6. Best way to build hourly booking + time logging + client approval: Cal.com/Calendly + Stripe, Sharetribe, or custom? Estimate build effort.
7. How do we screen out and enforce no court work in booking (intake questions, task categories, lawyer attestations, flags for pending cases)?
8. How should a task-specific engagement letter and end-of-booking wrap-up be worded so the scope ends cleanly under Rule 1.2(c) and no ongoing duty remains?
9. Do we need California LRS certification (§6155) or state registrations if we charge per booking? Would a flat lawyer subscription avoid that?
10. What 1099-K / tax reporting duties does LegalGrads have vs. Stripe in 2026?
