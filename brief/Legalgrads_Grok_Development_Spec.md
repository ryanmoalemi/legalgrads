# Legalgrads — Full-Function Two-Sided Marketplace Demo Specification

## Objective
Build a polished, fully interactive pitch demo of Legalgrads, a marketplace **exclusively for newly licensed attorneys** and clients seeking legal help. Match the approved visual mockups: warm cream background, midnight navy text, purple/pink/orange gradient branding, restrained handwritten arrows, modern minimal icons, rounded cards, attorney photos, and responsive desktop/mobile layouts. The hero is exactly: **“Fresh out of law school. Ready to work for you.”** Supporting copy: **“Hire newly licensed attorneys who are ready to build their practices.”**

The application must be demonstrable end-to-end without live external services. All displayed attorneys, reviews, rates, transactions, license records, messages, and client matters must be labeled **DEMO / fictional**. Do not invent actual bar verification, reviews, media endorsements, or performance claims. Use seed data that is realistic but explicitly synthetic. Never include an established-lawyer category or premium upsell.

## Suggested implementation
- Next.js + TypeScript + Tailwind CSS + shadcn/ui or equivalent accessible components.
- PostgreSQL + Prisma for durable demo data, or SQLite locally with an adapter allowing production migration.
- Auth.js or equivalent, with **one-click demo role switching** to a seeded client and a seeded attorney. Include password-based demo signup/login if feasible.
- Use server-side authorization for every data read and mutation. Client users cannot see other clients' private matters; attorneys can access only their own inquiries and matters.
- All controls are functional, keyboard accessible, mobile responsive, and give feedback on loading, empty, error, and success states.
- Support demo reset/reseed so a partner can repeat the walkthrough.
- Simulate emails, payments, verification, and calendar integrations; explicitly mark as simulated. Do not collect real card details or send actual client confidential information.

## Navigation
**Public:** Home, Find a Lawyer, Practice Areas, How It Works, For Attorneys, Log In / Sign Up.
**Client:** Dashboard, Saved Attorneys, Requests, Messages, Appointments, Matters, Account.
**Attorney:** Dashboard, Leads, Messages, Calendar, Matters, Services & Pricing, Public Profile, Verification, Settings.
**Demo controls:** Switch to Client, Switch to Attorney, Reset Demo. Visible only in demo mode.

## Page 1: Home
- Two-line hero, prominent search box, 4 specialty shortcut cards, featured *newly licensed* attorney cards, four benefit icons (More Affordable, Newly Licensed, Verified Attorneys, Wide Range of Help), illustrated handwritten callouts.
- Search accepts text (e.g. “review an NDA”), suggests specialties, and routes to results with matching query.
- Specialty shortcuts route to intake with preselected category.
- Attorney cards route to their detail page.
- Logged-out users can browse, but initiating a booking or saving favorites prompts login and then resumes the intended action.
- On the prelaunch variant, show waitlist instead of live booking; for the pitch demo, provide an obvious “Explore interactive demo” action and clearly label the product as a demo.

## Page 2: Specialty Selection & Intake
- Select one or multiple specialties: Contracts, Start a Business, Real Estate, Employment, Intellectual Property, Estate Planning, Family Law, Consumer Rights.
- Follow with a short guided form: jurisdiction/state, short nonconfidential description, desired service (consultation, fixed-price project, hourly help), budget range, timeline/urgency, remote/in-person preference.
- Show dynamic progress; support Back, Continue, edit previous answers, validation, and resume after refresh.
- Match based on jurisdiction eligibility, specialties, service availability, budget, and optional location; never present attorneys not eligible in the relevant jurisdiction as a match.
- Show an empty state with options to change filters or join notifications, never fabricate matches.

## Page 3: Search Results
- Filters: specialty, licensed jurisdiction, rate min/max, graduation/admission recency, fixed-price services, consultation availability, remote/in-person; sort by relevance, lowest price, newest, response time (only if seeded and labeled demo).
- Filters update results and URL query parameters, work in combination, and persist on browser back.
- Results cards show portrait, name, bar jurisdiction, license status (DEMO verified), school/year, specialties, hourly rate or starting fixed price, short bio, and buttons View Profile and Save.
- No invented ratings. Show review counts only when seeded as fictional demo reviews and explicitly marked.
- Pagination or load-more; clear filters; skeleton loaders; accessible empty states.
- Favorites persist to the current client account and appear in Saved Attorneys.

## Page 4: Attorney Profile
- Public overview: photo, display name, newly licensed badge, jurisdiction and bar admission date, school/year, professional background, specialties, hourly rate, fixed-price packages, languages, availability, work format, demo reviews, verification details, and FAQs.
- “License verified” only if the demo verification record says approved; always add a demo badge. Include state and simulated verification date. Never use fabricated real bar numbers.
- Buttons: Save, Message, Request Consultation, Request Quote, Select Fixed-Price Service.
- Consultation form: matter category, short description, requested slots, duration, contact preference. Must produce a persistent request visible to both sides.
- Quote form: description, desired outcome, deadline, budget; avoid collecting sensitive details before a secure intake and attorney conflict check.
- Services show price, scope, deliverables, estimated turnaround, exclusions, and whether consultation is included.

## Page 5: How It Works
- Four steps: Choose a Specialty → Compare New Lawyers → Request a Consultation → Get Legal Help.
- Each step has a working CTA that routes into the corresponding demo step.
- Explain that attorney-client relationships do not begin merely by sending a message; conflicts and engagement terms are reviewed first.
- FAQ accordions function, including licensing, rates, jurisdiction, confidentiality, and the difference between platform and attorney.

## Page 6: For Attorneys / Onboarding
- Dedicated landing page exclusively for newly licensed attorneys; CTA “Create Your Profile.”
- Multi-step signup: identity and contact, bar jurisdiction/admission date/status, law school and graduation year, specialty selections, bio and relevant experience, rates, fixed-price services, consultation availability, profile preview, submission.
- Configurable **newly licensed eligibility window** (default demo: within 3 years of admission), clearly explained. Bar admission required to be publicly bookable; graduates awaiting admission may create a draft but cannot appear as attorneys for hire.
- Verification is simulated, with pending/approved/rejected statuses; a seeded demo administrator can approve/reject, and only approved active profiles appear in search.
- Preview profile before publishing; editing fields immediately updates search and public profile after save.

## Page 7: Client Dashboard
- Overview cards: open inquiries, upcoming consultations, active matters, unread messages, saved attorneys.
- Requests list with status and linked attorney; click to see history and actions.
- Appointments: proposed, confirmed, rescheduled, cancelled, completed; client can accept an offered slot or request reschedule.
- Matters: milestones, scope, attached demo files, activity log, and closeout/review option.
- Messages: threaded conversations with unread counts, timestamps, attachments as safe demo fixtures, and status changes.
- Notifications are in-app and simulated email alerts (activity log), not actual email delivery.

## Page 8: Attorney Dashboard
- Overview: new leads, awaiting conflict review, consultations, active matters, unread messages, demo earnings (clearly simulated).
- Lead inbox: see request, category, jurisdiction, deadline, budget, and status; Accept for Review, Request Details, Decline, or Propose Consultation.
- **Conflict review gate:** lead acceptance does not automatically establish representation. Attorney marks conflicts cleared, then sends engagement terms. Only client acceptance activates a matter.
- Manage services and rates; changes propagate to public profile/search. Edit available slots, block time, approve/reschedule/cancel consultation requests.
- Matters: update milestones, send messages, upload demo deliverables, mark complete, request feedback.
- Demo analytics: profile views, leads, conversion, response time. Mark all figures simulated.

## Page 9: Messaging
- Client/attorney thread per inquiry or matter; send/receive messages across role switch without refreshing or via polling.
- Read/unread state, timestamps, basic file attachment placeholders, conversation search, and message history.
- Before engagement, show a privacy notice advising users not to share privileged or highly sensitive facts through general inquiry forms.
- No ability to access a thread without membership.

## Page 10: Booking & Calendar
- Attorney publishes available appointment slots, duration, and timezone. Client requests a slot; attorney confirms or proposes another.
- Enforce no double booking, proper timezone display, cancellation/rescheduling, and status transitions.
- Confirmation updates both dashboards and the notifications/activity feed.
- Video meeting links are simulated and marked demo; never generate live conference rooms unless configured.

## Page 11: Quotes, Engagement & Matters
- Client requests service or quote → attorney reviews conflict and scope → attorney proposes fixed-price/hourly terms → client accepts/declines → matter becomes active.
- Quotes include service description, deliverables, scope exclusions, price, deadline, revisions, jurisdiction, and expiration.
- Payments are **simulated**: display “Demo payment — no money charged,” and record a synthetic payment status after explicit client confirmation.
- Matter statuses: draft, inquiry, conflict_review, proposal_sent, engagement_accepted, active, completed, cancelled, disputed (demo only).
- Completion prompts a review, but review publication requires actual completed demo matter linkage.

## Page 12: Reviews & Trust
- Only clients with completed matters can submit a review; one review per matter; edits permitted within a configured window.
- All seed reviews are visibly labeled fictional demonstration content. New attorneys can legitimately have zero reviews.
- Verification UI displays bar jurisdiction, simulated verification result, and verification date, but no false real-world credential claims.
- Add reporting/moderation states for inappropriate content.

## Shared data model (minimum)
User(id, role, name, email, passwordHash, createdAt)
ClientProfile(userId, location, preferences)
AttorneyProfile(userId, displayName, bio, lawSchool, graduationYear, admissionDate, licenseJurisdiction, licenseStatus, verificationStatus, eligibilityStatus, hourlyRate, photoUrl, languages, remoteAllowed, isPublished)
Specialty(id, slug, name, description, icon)
AttorneySpecialty(attorneyId, specialtyId)
Service(id, attorneyId, title, scope, exclusions, fixedPrice, turnaroundDays, active)
AvailabilitySlot(id, attorneyId, startAtUtc, endAtUtc, status)
Favorite(clientId, attorneyId)
Inquiry(id, clientId, attorneyId, specialtyId, description, budget, urgency, jurisdiction, status, createdAt)
Conversation(id, inquiryId, matterId nullable)
ConversationMember(conversationId, userId)
Message(id, conversationId, senderId, body, createdAt, readAt)
Appointment(id, inquiryId, attorneyId, clientId, slotId, status, meetingMode)
ConflictCheck(id, inquiryId, attorneyId, status, checkedAt)
Proposal(id, inquiryId, attorneyId, scope, priceType, price, deadline, expiresAt, status)
Engagement(id, proposalId, clientAcceptedAt, attorneyAcceptedAt, status)
Matter(id, engagementId, clientId, attorneyId, status, startedAt, completedAt)
MatterMilestone(id, matterId, title, dueAt, status)
DemoPayment(id, matterId, amount, status, simulated=true)
Review(id, matterId, clientId, attorneyId, rating, text, isDemo, createdAt)
Notification(id, userId, type, payload, readAt)
ActivityEvent(id, actorId, objectType, objectId, action, createdAt)
WaitlistEntry(id, email, role, createdAt)

Use normalized IDs, foreign keys, timestamps, unique constraints, and server-side access control. Maintain a complete activity trail for demo state transitions.

## Business logic and validation
- Never show inactive, unverified, or not-yet-admitted lawyers as bookable attorneys.
- Never list established attorneys outside the configurable newly licensed eligibility window.
- Enforce license jurisdiction matching; prevent booking for matters outside eligibility unless specifically reviewed.
- Validate rate >= 0, fixed-fee scope, required form fields, time slot uniqueness, state transitions, and duplicate review prevention.
- Avoid implying that the marketplace itself practices law. All attorney-client engagements require attorney approval, conflict clearance, and client agreement.
- Do not promise legal outcomes or price savings percentages without evidence.
- Comply with applicable professional responsibility, advertising, referral service, fee-sharing, and trust accounting rules before any real deployment; demo payments and referrals remain simulated.

## Seed data
- 12 fictional newly licensed attorneys across several jurisdictions and specialties, 2 fictional clients, 20 services, availability slots, 8 inquiries, 4 appointments, 3 active matters, 6 demo conversations, and a handful of completed matters/reviews.
- Include one new attorney with **zero reviews**, one pending verification, and one awaiting bar admission who is excluded from search.
- Use recognizable demo identities such as Maya R. and Jordan K. but mark them fictional. Never use real people’s identities or bar numbers.
- Seed a client inquiry and an attorney account linked to it for the live partner walkthrough.

## Acceptance tests — MUST PASS
1. Select Contracts on homepage → intake retains Contracts → results show eligible Contracts attorneys.
2. Change jurisdiction to California → only California-eligible attorneys remain.
3. Save Maya → Maya appears in client favorites after reload.
4. Open Maya → request consultation → attorney dashboard shows new inquiry after switching role.
5. Attorney proposes slot → client sees offer → client confirms → both calendars update.
6. Client sends message → attorney sees it → attorney replies → client sees reply.
7. Attorney edits hourly rate and adds a fixed-price service → profile/search updates.
8. Attorney marks conflict cleared, sends proposal → client accepts → active matter appears on both dashboards.
9. Mark matter completed → eligible client submits review → review appears on profile with DEMO label.
10. Pending/unlicensed/out-of-window attorneys never appear in bookable search results.
11. Attempt unauthorized access to another client's inquiry → access denied.
12. Refresh any page or restart server → persisted data remains.
13. Reset Demo restores the original seed dataset and repeatable walkthrough.
14. All pages work at 375px mobile, tablet, and desktop; no horizontal overflow; all four benefit icons present.
15. No dead buttons, fake links, unhandled loading states, or claims of real verification, payments, or press coverage.

## Demo walkthrough for potential partners (5–7 minutes)
1. Show homepage and choose Contracts.
2. Complete quick intake and filter matching attorneys.
3. Open Maya’s profile, compare service packages, save profile, and request consultation.
4. Switch to attorney view; show the incoming lead and send a proposed slot.
5. Switch to client; confirm slot and message attorney.
6. Switch to attorney; clear simulated conflict review and send fixed-fee proposal.
7. Switch to client; accept engagement and simulated payment.
8. Switch to attorney; update milestone and complete matter.
9. Switch to client; leave fictional demo review.
10. Show attorney onboarding, editable rates/specialties, and responsive mobile experience.

## Delivery instructions for Grok
Produce the complete runnable application, not just screenshots or design fragments. Include package files, database schema, migrations, seed script, demo login credentials, setup commands, test commands, and README. Run the app, resolve errors, and demonstrate all acceptance tests. Provide a live preview or deployment instructions if deployment credentials are not available. Never silently substitute nonfunctional placeholder buttons for required functionality.
