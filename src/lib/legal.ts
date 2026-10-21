import { CONTACT_EMAIL, TERMS_UPDATED_AT, TERMS_VERSION } from './catalog';

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  draft: boolean;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
}

const draftIntro = `DRAFT — ${TERMS_UPDATED_AT.slice(0, 10)}, version ${TERMS_VERSION}. This page is illustrative pitch-demo copy for Legalgrads. It is not legal advice, not a legally approved policy, and not a certification of compliance. Licensed counsel must review marketplace classification, advertising, referral compensation, bar rules, privacy, security, and payments before any real launch.`;

const contact = `Questions about this draft: ${CONTACT_EMAIL}. Legalgrads does not publish a street address or telephone number in this demo, and it does not claim any regulator, bar association, or certification has approved the product.`;

export const DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'Draft client terms and draft attorney terms for the Legalgrads demo.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, `These terms are version ${TERMS_VERSION}. The demo records the version and time when an account is created. If a demo admin publishes a new draft version, you must accept it again before continuing. Nothing here has been adopted as a binding production contract.`] },
      { heading: 'Who we are', paragraphs: [`Legalgrads is the name used in this demo for a proposed two-sided marketplace. Legalgrads is not a law firm, not a lawyer, and not a certified lawyer-referral service. The platform does not practice law and does not form an attorney-client relationship with you by letting you browse, create an account, or send a message.`] },
      { heading: 'Client terms', paragraphs: [
        'You must be an adult to create a client account in this demo. You agree that profiles, rates, reviews, messages, and payments you see are fictional demonstration data stored in your browser.',
        'Sending an inquiry, saving an attorney, or exchanging messages does not hire anyone and does not create attorney-client privilege. Representation starts only if a licensed attorney clears a conflict and you accept separate engagement terms.',
        'Do not submit real secrets, government identifiers, health details, or documents you would only share with your own lawyer. The initial forms are a minimal, non-confidential intake.',
        'Cancellations in the demo simply change a status. No real money is collected, so there is nothing to refund. A production service would need a written cancellation and refund policy reviewed by counsel.',
        'You will not misuse the demo, scrape other people’s matters, or try to view an inquiry that is not yours. The data layer refuses those reads.',
      ] },
      { heading: 'Attorney terms', paragraphs: [
        'The demo is only for newly licensed attorneys, using a configurable window that defaults to three years after admission. Attorneys outside that window are not shown as available for hire.',
        'Bar admission is required before a profile can be published or a legal matter accepted. A graduate who is not yet admitted may save a draft and cannot appear in search.',
        'Verification badges in this demo are simulated. They are not a statement that any state bar was contacted. Production use would require primary-source status checks, disciplinary checks, and periodic rechecks.',
        'No platform fee is charged in the demo. This draft does not authorize a per-referral fee or a percentage of legal fees. Any future fee model has to be cleared under the fee-sharing and referral rules of each state before it is turned on.',
        'You are responsible for your own license, conflicts, and the advice you would give in a real engagement. The marketplace does not supervise your legal work and does not insure it.',
      ] },
      { heading: 'Fees, conduct, and suspension', paragraphs: [
        'Demo payments display the words “Demo payment — no money charged” and record a synthetic status only after you confirm that notice. There is no card form.',
        'We may suspend a demo profile for abuse, impersonation, or a report. That suspension is local to this browser’s dataset.',
        'You keep ownership of the text you type. You give Legalgrads permission to display it inside the demo. Do not upload content you do not have rights to use. Headshots shipped with the demo are fictional portraits, not photos of the people named in the interface.',
      ] },
      { heading: 'Disputes, governing law, and changes', paragraphs: [
        'A production version would need a dispute process, including how clients and attorneys resolve fee disputes, and a choice of governing law. As a draft, this demo proposes California law only as a placeholder for counsel to replace. The demo itself is not an offer to litigate or arbitrate anything.',
        'If these draft terms change in a material way, the version string changes and the demo asks you to accept the new version. Older acceptances stay in the activity history.',
        contact,
      ] },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'Draft privacy notice for the Legalgrads browser demo.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, 'This notice describes what the demo actually does. It does not promise controls that are not built.'] },
      { heading: 'Who this covers', paragraphs: [`This policy is written for Legalgrads. The demo runs entirely in your browser as a static site. There is no Legalgrads account server behind this pitch build. Contact: ${CONTACT_EMAIL}.`] },
      { heading: 'Categories we collect in the demo', paragraphs: [
        'Account data you type: name, email, password (stored as a demo hash, not bcrypt), role, and an adult confirmation.',
        'Intake and matter data you type: jurisdiction, a short description, budget, messages, appointment status, and reviews. You should not type real secrets.',
        'Technical data stored locally: the demo database (IndexedDB), your role selection, cookie preferences, and, only if you opt in, a local log of fake analytics events.',
        'We do not ask for payment card numbers, government ID numbers, or precise location. Attorney “bar” records are synthetic labels, not real license numbers.',
      ] },
      { heading: 'Purposes and sources', paragraphs: [
        'The demo uses this information to let you click through search, messaging, booking, engagement, and reviews on one device. That is the only purpose implemented here.',
        'Sources are you, and the fictional seed data that shipped with the site. We do not buy data and we do not receive data from a bar association.',
      ] },
      { heading: 'Sharing', paragraphs: [
        'The demo does not sell personal information and does not share it with advertising networks. Other people using a different browser cannot see your database.',
        'Inside your own browser, the demo admin role can see demo inquiries, privacy tickets, and the audit log. A client cannot read another client’s inquiries. An attorney sees only their own leads.',
        'A production service that hosted this data on a server would need a separate, counsel-reviewed list of processors, such as a host, email vendor, and payments company. Those vendors are not used here.',
      ] },
      { heading: 'Retention and deletion', paragraphs: [
        'Data stays in this browser until you clear site data, reset the demo, or use the deletion flow. Reset Demo restores the original fictional seed and removes changes you made.',
        'Account deletion anonymizes your name and email, blanks message text you sent, and unpublishes an attorney profile. A short audit event is retained without your old email. Simulated payment rows have no card data to keep.',
        'Export downloads a JSON file of records linked to your demo user. It does not include other people’s private matters.',
      ] },
      { heading: 'Security', paragraphs: [
        'The static site is served over HTTPS when hosted on legalgrads.com. The demo database is not encrypted beyond what the browser and the operating system provide. There is no server-side access control because there is no server session. Do not treat this demo as a confidential system.',
        'Production would need encryption in transit and at rest, access control on a server, upload scanning, and security logging. Those controls are described as targets on the Security page and are not all implemented in this pitch build.',
      ] },
      { heading: 'Cookies and similar storage', paragraphs: [
        'Strictly necessary storage is the demo database, the session key that remembers which demo user you picked, and your cookie choice. It is always on because the demo does not function without it.',
        'Analytics and marketing storage stay off until you opt in. The demo never loads a third-party analytics or advertising script. If you opt in, a button on the cookie settings page writes a fake event to local storage so you can see the gate work.',
      ] },
      { heading: 'Your requests', paragraphs: [
        'You can submit a demo request for access, correction, deletion, or opt-out of sale or sharing. The request becomes a ticket in the local admin log. A demo admin can complete it or reject it with a reason. That workflow illustrates the process. It is not a determination that any particular state privacy statute applies to Legalgrads.',
        'California residents have statutory rights where the law applies. This draft does not claim that every CCPA/CPRA obligation automatically applies to this project. Counsel should decide applicability, thresholds, and required notices before launch.',
      ] },
      { heading: 'History', paragraphs: [`Effective date of this draft: October 21, 2026. Version ${TERMS_VERSION}. No earlier public version has been issued. ${contact}`] },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'What this demo stores in the browser.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro] },
      { heading: 'Strictly necessary', paragraphs: ['Necessary storage remembers the demo database, which fictional user you are viewing as, and the cookie choice itself. These stay on. The demo does not use them to advertise.'] },
      { heading: 'Analytics', paragraphs: ['Off unless you opt in. Opting in does not install Google Analytics or any other third-party tag. It only allows the cookie settings page to record a local demo event.'] },
      { heading: 'Marketing', paragraphs: ['Off unless you opt in. The demo has no ads. A marketing opt-in only unlocks a local demo event so the preference can be tested. You can withdraw either choice at any time on the cookie settings page. Withdrawal stops new demo events and clears the local event log when both optional categories are off.'] },
      { heading: 'How to choose', paragraphs: [`Use Accept, Reject optional, or Customize on the banner. Your choice is stored and read again after reload. ${contact}`] },
    ],
  },
  disclaimers: {
    slug: 'disclaimers',
    title: 'Disclaimers',
    description: 'No legal advice and no attorney-client relationship from using the demo.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro] },
      { heading: 'No legal advice', paragraphs: ['Legalgrads is a platform demo, not a law firm. Text on this site, including attorney bios and sample messages, is not legal advice and is not tailored to your facts.'] },
      { heading: 'No attorney-client relationship', paragraphs: ['Browsing, creating an account, saving a profile, or sending a request does not make anyone your lawyer. An attorney-client relationship would begin only under a separate engagement the lawyer offers and you accept, after the lawyer’s own conflict review. Initial marketplace submissions should not be treated as privileged.'] },
      { heading: 'No outcome promises', paragraphs: ['The demo does not promise a result, a price savings percentage, or that any attorney is a good fit. Benefit lines on the homepage describe the product idea. They are not measured claims.'] },
      { heading: 'Fictional content', paragraphs: [`Every attorney, school reference, rate, review, verification badge, and payment in the interactive demo is fictional. ${contact}`] },
    ],
  },
  'attorney-advertising': {
    slug: 'attorney-advertising',
    title: 'Attorney Advertising',
    description: 'How demo listings are ordered, and what this site is not.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, 'Have counsel review lawyer advertising rules and lawyer-referral-service rules in every state before any real launch. This page is not that review.'] },
      { heading: 'This is not a certified referral service', paragraphs: ['Legalgrads does not claim to be a bar-certified lawyer referral service. Listings in the demo are not paid placements and are not sponsored. Nobody paid to appear.'] },
      { heading: 'How results are ordered', paragraphs: ['Default order puts the two featured fictional profiles first, then name. You can sort by lowest demo price, newest demo admission date, or a seeded demo response time. Those sorts use the fictional fields you can see. They are not a quality ranking and not a statement about legal skill.'] },
      { heading: 'Newly licensed only', paragraphs: ['Search shows attorneys only when the demo record says they are admitted, inside the eligibility window, and marked with a simulated approval. A pending, unlicensed, or out-of-window profile is not offered as available for hire.'] },
      { heading: 'Fees', paragraphs: [`The demo does not charge a per-referral fee or take a percentage of legal fees. Do not read this pitch as permission to do so. ${contact}`] },
    ],
  },
  'referral-disclosure': {
    slug: 'referral-disclosure',
    title: 'Referral Disclosure',
    description: 'Draft disclosure about referrals and fees.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro] },
      { heading: 'What happens in this demo', paragraphs: ['Choosing an attorney sends a fictional lead to that attorney’s demo inbox. Legalgrads does not take a fee for that click. There is no paid ranking.'] },
      { heading: 'What production would need', paragraphs: ['Before a real referral or fee-sharing model launches, counsel needs to clear the rules that apply in each state where a client or attorney sits, including California’s lawyer-referral rules and any rule that limits splitting fees with a non-lawyer. Until that review is done, the product must not collect a referral fee.'] },
      { heading: 'Your relationship', paragraphs: [`Any engagement is between the client and the attorney, on terms they both accept. The platform is not a party to that engagement in this demo. ${contact}`] },
    ],
  },
  security: {
    slug: 'security',
    title: 'Security',
    description: 'What this demo protects, and what production still needs.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, 'This page does not claim a security certification.'] },
      { heading: 'Implemented in the demo', paragraphs: [
        'Role checks live in the data layer. A client who asks for another client’s inquiry receives an access denial and does not see the record.',
        'Messages can be opened only by conversation members or the demo admin.',
        'The static site does not send your demo database to a Legalgrads server.',
        'Optional analytics tags are not loaded.',
      ] },
      { heading: 'Not implemented, and required before production', paragraphs: [
        'Server-side authentication, encryption at rest, file-upload scanning, intrusion detection, backup, and a vulnerability management program are not part of this pitch build.',
        'Do not store real client confidential information in the demo.',
        `Report a demo issue to ${CONTACT_EMAIL}.`,
      ] },
    ],
  },
  'do-not-sell-or-share': {
    slug: 'do-not-sell-or-share',
    title: 'Do Not Sell or Share',
    description: 'Sale and sharing opt-out for the demo.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, 'Submitting a request here does not mean every California privacy rule applies to Legalgrads. Counsel has to make that call.'] },
      { heading: 'Our demo practice', paragraphs: ['This pitch build does not sell personal information and does not share it for cross-context behavioral advertising. There is no advertising cookie.'] },
      { heading: 'How to opt out anyway', paragraphs: [`Use the privacy request form and choose “Opt out of sale or sharing.” The ticket is stored in this browser and appears in the demo admin log, where it can be completed or rejected with a reason. You can also turn marketing storage off in cookie settings. Contact ${CONTACT_EMAIL}.`] },
    ],
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility',
    description: 'Accessibility goals for the Legalgrads demo. Not a conformance certificate.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro, 'Legalgrads aims at WCAG 2.2 AA. This statement does not certify that the demo meets that standard.'] },
      { heading: 'What we designed for', paragraphs: [
        'Pages use headings, landmarks, labels on fields, keyboard focus, and visible buttons. The mobile layout is built to work at 375 pixels wide without sideways scrolling.',
        'Motion is reduced when your system asks for it. Color contrast for body text is navy or ink on cream.',
        'Some decorative handwritten notes are supplemental to the text next to them.',
      ] },
      { heading: 'Contact', paragraphs: [`If something blocks you, email ${CONTACT_EMAIL} with the page address and what you were trying to do. This demo inbox is not monitored as a production support desk.`] },
    ],
  },
  legal: {
    slug: 'legal',
    title: 'Legal',
    description: 'Index of draft Legalgrads policies.',
    draft: true,
    updated: TERMS_UPDATED_AT,
    sections: [
      { heading: 'Draft notice', paragraphs: [draftIntro] },
      { heading: 'Policies in this demo', paragraphs: [
        'Terms of Service, Privacy Policy, Cookie Policy, Disclaimers, Attorney Advertising, Referral Disclosure, Security, Do Not Sell or Share, and Accessibility are separate pages. Each one is a draft.',
        'Privacy requests, data export and deletion, cookie settings, and abuse reports are working demo flows. They store tickets in this browser.',
        contact,
      ] },
    ],
  },
};

export const DOC_LIST = Object.values(DOCS);
