import { CONTACT_EMAIL } from './site';

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
}

const updated = '2026-10-21';
const contact = `Questions and privacy requests go to ${CONTACT_EMAIL}. Legalgrads has not published a street address or phone number.`;

export const DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'These terms cover people who browse Legalgrads or join the consumer waitlist. Attorney listings are covered by the Attorney Terms.',
    updated,
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          'Legalgrads is a directory for newly licensed attorneys in all 50 U.S. states and DC. Legalgrads is not a law firm and not your attorney. Legalgrads is not a lawyer referral service certified by any state bar, and it does not charge attorneys or clients per lead or take a share of legal fees. Using the site does not create an attorney-client relationship with Legalgrads.',
          contact,
        ],
      },
      {
        heading: 'The directory',
        paragraphs: [
          'A listing appears only after Legalgrads manually checks the attorney’s record with the state bar where they are licensed. Until then, the directory may be empty. An empty directory is not a match and is not legal advice.',
          'If you contact an attorney, that relationship is between you and the attorney. Legalgrads does not supervise the legal work, does not take a referral fee, and does not take a share of legal fees.',
        ],
      },
      {
        heading: 'Waitlist',
        paragraphs: [
          'If you leave an email address, we use it to tell you when published listings are available. You can ask us to delete it by emailing ' + CONTACT_EMAIL + '.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'Do not misuse the site, attempt to read other people’s applications, or present yourself as an attorney if you are not admitted to practice in the state you list.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'The site is provided as available. Legalgrads does not guarantee that a listing is the right lawyer for your matter, or that an attorney will respond. To the extent the law allows, Legalgrads is not liable for an attorney’s advice or for decisions you make after reading a listing.',
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'What Legalgrads collects, why, and how to reach us.',
    updated,
    sections: [
      {
        heading: 'Who this policy covers',
        paragraphs: [
          'This policy describes personal information handled by Legalgrads. It applies to the public website, the consumer waitlist, and attorney applications.',
          contact,
        ],
      },
      {
        heading: 'Information we collect',
        paragraphs: [
          'If you join the consumer waitlist, we collect your email address and the page you signed up from.',
          'If you apply as an attorney, we collect your name, email, phone, whether you want your phone on the public listing, state of licensure, bar number, admission date, practice areas, cities served, bio, languages, contact method, optional photo, your professional-liability insurance choice, and the time you agreed to the Attorney Terms.',
          'If you message an attorney from a listing, we collect your name, email, optional phone, and the message.',
          'We store a cookie preference on your device. If you opt in, a local analytics note stays in that browser. We do not load third-party advertising trackers.',
          'Attorney profile pages show a first-party, cookieless view count. When a profile loads, our server records one view per visitor per profile per day using a one-way hash of the IP address and browser type with a salt that changes daily and is then discarded. We never store the IP address, and nothing is saved in your browser. Only the daily totals per profile are kept, to show how many people viewed it.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use waitlist emails to announce when the directory has published attorneys. We use attorney applications to review state bar records and, if the review passes, to publish a listing. We do not sell personal information and we do not share it for cross-context behavioral advertising.',
          'Messages sent through a listing contact form are relayed without showing either email address. Before delivery, messages are screened automatically for spam, which includes sending the sender name and message text to an AI classifier (Google Gemini). Messages that contain links are blocked. Screening can make mistakes; a blocked message is not a judgment about your legal matter.',
          'Application records and photos are stored in Supabase (Postgres and private file storage) when that service is configured. If it is not configured, the form opens an email to ' + CONTACT_EMAIL + ' so the information is not discarded.',
        ],
      },
      {
        heading: 'What the public can see',
        paragraphs: [
          'The public can read a profile only after it is published. A published profile can show name, bar number, admission date, practice areas, cities, bio, languages, an https website link if you provided one, the year the attorney joined Legalgrads, and an Insured badge only if you said you carry professional liability insurance. Your email is never shown. Clients use a secure contact form, and Legalgrads relays that message without showing either email address. Your phone appears only if you chose to show it. The Joined year is only that calendar year. It is not a quality rating and not a benefit to clients.',
        ],
      },
      {
        heading: 'Retention and requests',
        paragraphs: [
          'We keep applications while a listing is active and as needed for the bar-review record. Email ' + CONTACT_EMAIL + ' to request access, correction, or deletion. We may keep a short note that a request was completed, without the old message, where we need it for security.',
          'Legalgrads does not sell personal information. To opt out of any future sale or share, email ' + CONTACT_EMAIL + ' with the subject “Do not sell or share.”',
        ],
      },
    ],
  },
  'attorney-terms': {
    slug: 'attorney-terms',
    title: 'Attorney Terms',
    description: 'In short: Legalgrads is a directory, not a referral service. We do not take a referral fee or a share of your legal fees. You write the listing and you are responsible for it. We publish it only after a person checks your state bar record. Email ryan@legalgrads.com to change or remove it. Attorney login is not available yet.',
    updated,
    sections: [
      {
        heading: 'Free listing',
        paragraphs: [
          'The listing is free, and it shows the year you joined Legalgrads. That mark is not a quality rating and not a benefit to clients. Legalgrads takes no referral fee and no share of your legal fees. Your email stays private. Clients reach you through our secure contact form.',
          'A later premium product, if Legalgrads offers one, will be a flat fee for extra visibility only. It will not be priced per lead and it will not be a percentage of legal fees.',
        ],
      },
      {
        heading: 'Your license and insurance',
        paragraphs: [
          'You must be admitted to practice in the U.S. state or DC that you list. You submit that state, your bar number, and your admission date so Legalgrads can check them. You tell us whether you carry professional liability insurance. If you do not, you agree to make any disclosure to clients that your state’s rules require (for example, California Rule of Professional Conduct 1.4.2). An Insured badge is shown only when you say you carry insurance. Legalgrads does not provide that insurance.',
        ],
      },
      {
        heading: 'Verification before anything goes live',
        paragraphs: [
          'Submitting an application does not publish a listing. Legalgrads manually checks your state bar record. The listing goes live only after that review is marked verified. Legalgrads may reject an application or unpublish a listing.',
        ],
      },
      {
        heading: 'Your advertising',
        paragraphs: [
          'You are responsible for your own advertising content, including your bio, photo, and contact link. You agree that your listing will comply with the rules of professional conduct on lawyer communications and advertising in each state where you are licensed (in California, for example, Rules 7.1 and 7.2 and the Business and Professions Code). Legalgrads does not review your listing as a substitute for your own duties.',
        ],
      },
      {
        heading: 'No attorney-client relationship with Legalgrads',
        paragraphs: [
          'Legalgrads is not your client and is not your law firm. These terms are a directory agreement. ' + contact,
        ],
      },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'How this site stores preferences in the browser.',
    updated,
    sections: [
      {
        heading: 'What we store',
        paragraphs: [
          'Strictly necessary storage remembers your cookie choice. If Supabase sign-in is enabled in a later phase, the browser may also store that session. Optional analytics and marketing stay off unless you opt in. Opt-in events are recorded only in this browser. No third-party tracker is loaded.',
          'Use Cookie settings to change your choice. ' + contact,
        ],
      },
    ],
  },
  disclaimers: {
    slug: 'disclaimers',
    title: 'Disclaimers',
    description: 'Legalgrads is a directory, not your lawyer.',
    updated,
    sections: [
      {
        heading: 'Not legal advice',
        paragraphs: [
          'Text on this website is not legal advice and is not a recommendation of a particular attorney for your facts. An attorney-client relationship is formed only if you and a lawyer agree to one.',
          'Legalgrads is not a lawyer referral service certified by any state bar. Bar verification means Legalgrads checked the attorney’s state bar record before publishing. It is not a guarantee of a result, a promise about malpractice coverage beyond the attorney’s own confirmation, or a background-check product.',
        ],
      },
    ],
  },
  'attorney-advertising': {
    slug: 'attorney-advertising',
    title: 'Attorney Advertising',
    description: 'Who is responsible for a listing.',
    updated,
    sections: [
      {
        heading: 'Attorney-controlled content',
        paragraphs: [
          'Each listing is attorney advertising by the lawyer who submitted it, not an advertisement by Legalgrads for legal services. The attorney is responsible for the truth of the bio, photo, and claims. Legalgrads is the directory operator.',
          'Listings are shown only after a manual state bar check. ' + contact,
        ],
      },
    ],
  },
  'directory-disclosure': {
    slug: 'directory-disclosure',
    title: 'Directory Disclosure',
    description: 'Legalgrads is a directory. It does not match, recommend, or refer clients to lawyers.',
    updated,
    sections: [
      {
        heading: 'A directory, not a referral service',
        paragraphs: [
          'Legalgrads is a free directory. Clients browse listings and choose for themselves. Legalgrads does not match, recommend, or refer clients to any attorney, and it is not a lawyer referral service certified by any state bar. Legalgrads does not charge attorneys or consumers a referral fee and does not take a share of legal fees. A Joined year on a listing is only the year the attorney joined Legalgrads. It is not a quality rating.',
          'Choosing a lawyer from the directory is your decision. ' + contact,
        ],
      },
    ],
  },
  security: {
    slug: 'security',
    title: 'Security',
    description: 'How the directory is locked down.',
    updated,
    sections: [
      {
        heading: 'Access rules',
        paragraphs: [
          'When Supabase is configured, Row Level Security lets the public insert an application or a waitlist email and read only published profiles. The public cannot read other people’s applications. Review actions run only for accounts listed as admins. Photos sit in a private bucket until a file is placed in the published folder.',
          'Report a vulnerability to ' + CONTACT_EMAIL + '.',
        ],
      },
    ],
  },
  'do-not-sell-or-share': {
    slug: 'do-not-sell-or-share',
    title: 'Do Not Sell or Share',
    description: 'Legalgrads does not sell personal information.',
    updated,
    sections: [
      {
        heading: 'Sale and sharing',
        paragraphs: [
          'Legalgrads does not sell personal information and does not share it for cross-context behavioral advertising. Email ' + CONTACT_EMAIL + ' with the subject “Do not sell or share” if you want that preference recorded anyway.',
        ],
      },
    ],
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility',
    description: 'We want the site to be usable with a keyboard and a screen reader.',
    updated,
    sections: [
      {
        heading: 'Contact',
        paragraphs: [
          'If a page blocks you, email ' + CONTACT_EMAIL + ' and describe the page and the barrier. We will work on a practical fix.',
        ],
      },
    ],
  },
  legal: {
    slug: 'legal',
    title: 'Legal',
    description: 'The policies that govern Legalgrads.',
    updated,
    sections: [
      {
        heading: 'Documents',
        paragraphs: [
          'Read the Terms of Service, Privacy Policy, and Attorney Terms. Legalgrads is not a law firm. ' + contact,
        ],
      },
    ],
  },
};

export const LEGAL_LINKS: { href: string; title: string }[] = [
  { href: '/terms/', title: 'Terms of Service' },
  { href: '/privacy/', title: 'Privacy Policy' },
  { href: '/attorney-terms/', title: 'Attorney Terms' },
  { href: '/cookies/', title: 'Cookie Policy' },
  { href: '/disclaimers/', title: 'Disclaimers' },
  { href: '/attorney-advertising/', title: 'Attorney Advertising' },
  { href: '/directory-disclosure/', title: 'Directory Disclosure' },
  { href: '/security/', title: 'Security' },
  { href: '/do-not-sell-or-share/', title: 'Do Not Sell or Share' },
  { href: '/accessibility/', title: 'Accessibility' },
];
