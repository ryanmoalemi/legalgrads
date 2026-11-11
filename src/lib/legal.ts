import { ROSTER_SOURCES } from './rosters';
import { CONTACT_EMAIL } from './site';

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; paragraphs: string[]; links?: { href: string; label: string }[] }[];
}

const updated = '2026-10-21';
const updatedNov = '2026-11-11';

export const INQUIRY_NOTICE = 'Send a brief description only. Do not include confidential details or documents. Sending a request does not by itself hire a lawyer. The lawyer must confirm availability, check for conflicts, and agree to represent you.';
export const SPONSORED_LABEL = 'Paid placements will be clearly labeled as sponsored advertisements. Paying for placement will not mean that LegalGrads recommends a lawyer or rates that lawyer more highly, and it will not change how standard listings are ordered or described.';
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
          'The directory has two kinds of profiles. Unclaimed public profiles are live and come from official licensing rosters. Claimed profiles are the ones an attorney has verified: an email confirmation code, then a manual check of the state bar record. Browsing the directory is not a match and is not legal advice.',
          'If you contact an attorney, that relationship is between you and the attorney. Legalgrads does not supervise the legal work, does not take a referral fee, and does not take a share of legal fees.',
        ],
      },
      {
        heading: 'Waitlist',
        paragraphs: [
          'If you leave an email address, we use it to send directory updates. You can browse Unclaimed public profiles without joining that list. You can ask us to delete the address by emailing ' + CONTACT_EMAIL + '.',
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
          'If you send a request from a claimed attorney profile, we email your name, email, optional phone, optional business name, and your description to that attorney so they can reply to you directly. We do not keep a copy of the description. We keep a short delivery record (time, profile, and one-way hashes of your email and network address) for 90 days to count delivered requests and to stop spam.',
          'We store a cookie preference on your device. Google Analytics loads on our pages to count visits. Until you accept analytics, it runs in a cookieless mode (Google Consent Mode) and stores nothing in your browser. If you accept, Google Analytics may set its cookies. We do not load advertising trackers.',
          'Attorney profile pages record first-party, cookieless counts of page views, website-link taps, and phone-number taps. Our server counts one of each per visitor per profile per day using a one-way hash of the network address and browser type with a salt that changes daily and is then discarded. We never store the network address, nothing is saved in your browser, and known bots and link previews are skipped. These counts are shown only to the attorney who claimed the profile, on a private stats page. There is no public view counter.',
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
          'We keep applications while a listing is active and as needed for the bar-review record. Request delivery records are deleted after 90 days. Email ' + CONTACT_EMAIL + ' to request access, correction, or deletion. We may keep a short note that a request was completed, without the old message, where we need it for security.',
          'Legalgrads does not sell personal information. To opt out of any future sale or share, email ' + CONTACT_EMAIL + ' with the subject “Do not sell or share.”',
        ],
      },
    ],
  },
  'attorney-terms': {
    slug: 'attorney-terms',
    title: 'Attorney Terms',
    description: 'In short: LegalGrads is a directory, not a referral service. Your standard listing is free for life. We take no referral fee and no share of your legal fees. You write your profile and you are responsible for it. Email ryan@legalgrads.com to change or remove it.',
    updated: updatedNov,
    sections: [
      {
        heading: 'Free listing',
        paragraphs: [
          'Your standard listing is free for life. You never pay to claim it, keep it, or edit it. Legalgrads takes no referral fee and no share of your legal fees.',
          'Listings created through the attorney application show the year you joined Legalgrads. That mark is not a quality rating and not a benefit to clients.',
          'Optional sponsored placements may be offered in the future. If they are, they will be a flat fee for extra visibility only. They will not be priced per lead and will not be a percentage of legal fees. ' + SPONSORED_LABEL,
        ],
        links: [{ href: '/free-listing-promise/', label: 'Our free listing promise' }],
      },
      {
        heading: 'Claiming an existing profile',
        paragraphs: [
          'Many profiles start as unclaimed pages built from public licensing records. To claim one, open the profile, choose Claim my free profile, and confirm that you are the attorney. When the State Bar record lists an email address, we send a six-digit confirmation code to that address. Otherwise we send it to the email address you enter. The code expires in 30 minutes, and you can ask for a new one.',
          'If the email matches the official record, a firm domain on file, or your law school domain, your claim is confirmed and your edits can show on your profile. If it does not match, your claim goes to manual review, and your edits stay hidden from the public until we confirm it. You may be asked to upload a photo of your bar card. Your bio and any services you type yourself wait for a short review before they show.',
          'The confirmation code signs you in on the device you used. There is no password login. Anyone who believes a profile was claimed by the wrong person can report it, and we hide that claim while we check.',
        ],
      },
      {
        heading: 'What you can add',
        paragraphs: [
          'A claimed profile can show your photo, a short bio, the services you offer, the kinds of clients you work with, how you hold consultations and whether they are free or paid, how you bill (hourly, fixed fee, or quoted), optional fixed fees, your availability with the date you last updated it, your phone number, your website, and your preferred contact method. Fields you leave blank stay off your profile. If you add no fee details, your profile says Ask about fees.',
          'You can turn on a request form. Requests are emailed to your verified email address with the sender as the reply-to address. LegalGrads does not keep the message, does not screen it for legal merit, and does not decide whether you take the matter. The form tells the sender: ' + INQUIRY_NOTICE,
          'You can see private stats for the last 30 days: profile views, website clicks, contact clicks, and delivered requests. Only you can see them.',
        ],
      },
      {
        heading: 'Applying for a new listing',
        paragraphs: [
          'Submitting an application does not publish a listing. Legalgrads manually checks your state bar record. The listing goes live only after that review is marked verified. Legalgrads may reject an application or unpublish a listing.',
        ],
      },
      {
        heading: 'Your license and insurance',
        paragraphs: [
          'You must be admitted to practice in the U.S. state or DC that you list. You tell us whether you carry professional liability insurance. If you do not, you agree to make any disclosure to clients that your state’s rules require (for example, California Rule of Professional Conduct 1.4.\u20602). An Insured badge is shown only when you say you carry insurance. Legalgrads does not provide that insurance.',
        ],
      },
      {
        heading: 'Your advertising',
        paragraphs: [
          'You are responsible for your own advertising content, including your bio, photo, services, fees, availability, and contact details. Keep them accurate and current. You agree that your profile will comply with the rules of professional conduct on lawyer communications and advertising in each state where you are licensed (in California, for example, Rules 7.1 and 7.2 and the Business and Professions Code). Legalgrads does not review your profile as a substitute for your own duties.',
        ],
      },
      {
        heading: 'Changes and removal',
        paragraphs: [
          'Email ryan@legalgrads.com to change or remove your profile, or use Request removal on the profile page.',
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
          'Strictly necessary storage remembers your cookie choice. If you claim a profile, the browser also stores your sign-in for that profile. Google Analytics loads on our pages to count visits. Until you accept analytics, it runs in a cookieless mode (Google Consent Mode) and sets no cookies. If you accept analytics, Google Analytics may set its cookies. Marketing stays off unless you opt in.',
          'Attorney profile pages also keep first-party, cookieless counts of views and link taps for the attorney who claimed the profile. They store nothing in your browser. See the Privacy Policy for details.',
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
  'how-we-build-legalgrads': {
    slug: 'how-we-build-legalgrads',
    title: 'How We Build Legalgrads',
    description: 'Where our attorney data comes from, how listings are checked, and what we will never do with rankings or ads.',
    updated,
    sections: [
      { heading: 'Who runs the site', paragraphs: ['Legalgrads is built and run by Ryan Moalemi. Questions about any page go to ' + CONTACT_EMAIL + '.'] },
      { heading: 'Where attorney data comes from', paragraphs: ['Unclaimed attorney pages are built from public licensing records. We show the name, bar number, license status, and admission date or year when the regulator publishes them. A year with no day stays a year. An admission date is not a graduation date and not an exam date. Office city is shown when it was published, and left blank when it was not. Each page links to an individual official record when the regulator publishes one. When the regulator publishes only a shared roster, the page links to that roster and does not call it an individual profile. The discipline line points to the regulator and does not assert a clean history. Confirm the current status with the regulator. The lookup pages below are the ones linked from profiles we publish. States with no published roster are not listed.'], links: ROSTER_SOURCES.map((source) => ({ href: source.href, label: `${source.name}: ${source.authority}` })) },
      { heading: 'How listings are checked', paragraphs: ['A claimed listing goes live only after two checks. The attorney confirms an email code, and a person then reviews the state bar record. The email code alone does not publish the attorney’s own bio. If a record changes or an attorney asks us to fix or remove a page, we update it as soon as we can.'] },
      { heading: 'What we do not do', paragraphs: ['Legalgrads is a browse-only directory. We do not match you with an attorney, we do not sell ranking in directory results, and we do not show ratings or reviews on unclaimed pages. Results are ordered by neutral rules such as location and name, never by payment. If optional sponsored placements are offered in the future, they will be labeled as sponsored and kept separate from directory results.', 'Legalgrads is not a law firm and is not a state-bar-certified lawyer referral service. Nothing on the site is legal advice.'] },
      { heading: 'Advertising', paragraphs: ['If the site shows ads, they are labeled and kept separate from directory listings. Advertisers never affect which attorneys appear or in what order. See our Privacy and Cookies pages for how ad cookies work and how to opt out.'] },
      { heading: 'Corrections', paragraphs: ['Spot a mistake? Email ' + CONTACT_EMAIL + ' with the page link and what is wrong.'] },
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
  { href: '/free-listing-promise/', title: 'Free Listing Promise' },
  { href: '/cookies/', title: 'Cookie Policy' },
  { href: '/disclaimers/', title: 'Disclaimers' },
  { href: '/attorney-advertising/', title: 'Attorney Advertising' },
  { href: '/directory-disclosure/', title: 'Directory Disclosure' },
  { href: '/security/', title: 'Security' },
  { href: '/do-not-sell-or-share/', title: 'Do Not Sell or Share' },
  { href: '/accessibility/', title: 'Accessibility' },
  { href: '/how-we-build-legalgrads/', title: 'How We Build Legalgrads' },
  { href: '/sitemap/', title: 'Site map' },
];
