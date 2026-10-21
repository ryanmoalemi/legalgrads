export const TERMS_VERSION = '2026-10-21-draft';
export const TERMS_UPDATED_AT = '2026-10-21T00:00:00.000Z';
export const DEMO_TODAY = '2026-10-21T15:00:00.000Z';
export const SEED_VERSION = 1;
export const REVIEW_EDIT_HOURS = 48;
export const CONTACT_EMAIL = 'ryan@legalgrads.com';
export const DEMO_PASSWORD = 'demo1234';

export const DEMO_IDS = {
  client: 'user_casey',
  client2: 'user_sam',
  attorney: 'user_maya',
  admin: 'user_admin',
  system: 'user_system',
} as const;

export const DEMO_USERS: { id: string; label: string }[] = [
  { id: 'user_casey', label: 'Casey Nguyen (Client)' },
  { id: 'user_sam', label: 'Sam Rivera (Client)' },
  { id: 'user_maya', label: 'Maya R. (Attorney)' },
  { id: 'user_jordan', label: 'Jordan K. (Attorney)' },
  { id: 'user_samantha', label: 'Samantha L. (Attorney)' },
  { id: 'user_chris', label: 'Chris T. (Attorney)' },
  { id: 'user_emily', label: 'Emily W. (Attorney)' },
  { id: 'user_alex', label: 'Alex J. (Attorney)' },
  { id: 'user_taylor', label: 'Taylor H. (Attorney)' },
  { id: 'user_brianna', label: 'Brianna C. (Attorney)' },
  { id: 'user_nicole', label: 'Nicole A. (Attorney, zero reviews)' },
  { id: 'user_kevin', label: 'Kevin S. (Attorney, verification pending)' },
  { id: 'user_ryan', label: 'Ryan P. (Not admitted)' },
  { id: 'user_daniel', label: 'Daniel M. (Outside eligibility window)' },
  { id: 'user_admin', label: 'Demo Admin' },
];

export const ATTORNEY_SLUGS = [
  'maya-r',
  'jordan-k',
  'samantha-l',
  'chris-t',
  'emily-w',
  'daniel-m',
  'alex-j',
  'taylor-h',
  'kevin-s',
  'brianna-c',
  'ryan-p',
  'nicole-a',
] as const;

export interface SpecialtyDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  examples: string;
}

export const SPECIALTIES: SpecialtyDef[] = [
  {
    id: 'spec_contracts',
    slug: 'contracts',
    name: 'Contracts',
    description: 'Review and draft everyday agreements for people and small businesses.',
    icon: '/icons/specialties/contracts.svg',
    examples: 'NDAs, service agreements, freelance contracts',
  },
  {
    id: 'spec_business',
    slug: 'start-a-business',
    name: 'Start a Business',
    description: 'Formation paperwork and founder questions for new ventures.',
    icon: '/icons/specialties/start_business.svg',
    examples: 'LLCs, operating agreements, founder paperwork',
  },
  {
    id: 'spec_real_estate',
    slug: 'real-estate',
    name: 'Real Estate',
    description: 'Residential leases and purchase paperwork. Not a brokerage.',
    icon: '/icons/specialties/real_estate.svg',
    examples: 'Leases, purchase agreements, disclosures',
  },
  {
    id: 'spec_employment',
    slug: 'employment',
    name: 'Employment',
    description: 'Offer letters, handbooks, and workplace questions.',
    icon: '/icons/specialties/employment.svg',
    examples: 'Offer letters, severance, wage questions',
  },
  {
    id: 'spec_ip',
    slug: 'intellectual-property',
    name: 'Intellectual Property',
    description: 'Early trademark and brand questions for new businesses.',
    icon: '/icons/specialties/intellectual_property.svg',
    examples: 'Brand names, trademark screening, IP memos',
  },
  {
    id: 'spec_estate',
    slug: 'estate-planning',
    name: 'Estate Planning',
    description: 'Simple wills and powers of attorney for individuals.',
    icon: '/icons/specialties/estate_planning.svg',
    examples: 'Wills, powers of attorney, directives',
  },
  {
    id: 'spec_family',
    slug: 'family-law',
    name: 'Family Law',
    description: 'Introductory family-law consultations. Not emergency counsel.',
    icon: '/icons/specialties/family_law.svg',
    examples: 'Consultations about agreements and court forms',
  },
  {
    id: 'spec_consumer',
    slug: 'consumer-rights',
    name: 'Consumer Rights',
    description: 'Everyday consumer disputes and demand-letter questions.',
    icon: '/icons/specialties/consumer_rights.svg',
    examples: 'Billing disputes, demand letters, refunds',
  },
];

export const STATES: { code: string; name: string }[] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
].map(([code, name]) => ({ code, name }));

export function stateName(code: string): string {
  return STATES.find((s) => s.code === code)?.name ?? code;
}
