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
    id: 'contracts',
    slug: 'contracts',
    name: 'Contracts',
    description: 'Everyday agreements for people and small businesses.',
    icon: '/icons/specialties/contracts.svg',
    examples: 'NDAs, service agreements, freelance contracts',
  },
  {
    id: 'start-a-business',
    slug: 'start-a-business',
    name: 'Start a Business',
    description: 'Formation paperwork and early founder questions.',
    icon: '/icons/specialties/start_business.svg',
    examples: 'LLCs, operating agreements, founder paperwork',
  },
  {
    id: 'real-estate',
    slug: 'real-estate',
    name: 'Real Estate',
    description: 'Residential leases and purchase paperwork.',
    icon: '/icons/specialties/real_estate.svg',
    examples: 'Leases, purchase agreements, disclosures',
  },
  {
    id: 'employment',
    slug: 'employment',
    name: 'Employment',
    description: 'Offer letters, handbooks, and workplace questions.',
    icon: '/icons/specialties/employment.svg',
    examples: 'Offer letters, severance, wage questions',
  },
  {
    id: 'intellectual-property',
    slug: 'intellectual-property',
    name: 'Intellectual Property',
    description: 'Early trademark and brand questions.',
    icon: '/icons/specialties/intellectual_property.svg',
    examples: 'Brand names, trademark screening',
  },
  {
    id: 'estate-planning',
    slug: 'estate-planning',
    name: 'Estate Planning',
    description: 'Wills and powers of attorney for individuals.',
    icon: '/icons/specialties/estate_planning.svg',
    examples: 'Wills, powers of attorney, directives',
  },
  {
    id: 'family-law',
    slug: 'family-law',
    name: 'Family Law',
    description: 'Introductory family-law consultations.',
    icon: '/icons/specialties/family_law.svg',
    examples: 'Agreements and court-form questions',
  },
  {
    id: 'consumer-rights',
    slug: 'consumer-rights',
    name: 'Consumer Rights',
    description: 'Everyday consumer disputes.',
    icon: '/icons/specialties/consumer_rights.svg',
    examples: 'Billing disputes, demand letters, refunds',
  },
];

export function specialtyName(slug: string): string {
  return SPECIALTIES.find((item) => item.slug === slug)?.name ?? slug;
}
