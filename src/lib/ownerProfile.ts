import type { OwnerClaim } from './claim';

export const SERVICE_OPTIONS = [
  'Contract drafting',
  'Contract review',
  'LLC or corporation formation',
  'Operating or partnership agreements',
  'Commercial leases',
  'Employment agreements and policies',
  'Independent contractor agreements',
  'Demand letters and collections',
  'Trademark basics',
  'Website terms and privacy policies',
  'Buying or selling a business',
  'Business licenses and compliance',
] as const;

export const CLIENT_TYPES = [
  'Solo owners and freelancers',
  'Startups',
  'Small businesses (under 50 people)',
  'Restaurants and retail',
  'Contractors and trades',
  'Online and creative businesses',
  'Nonprofits',
] as const;

export const CONSULT_MODES = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video' },
  { value: 'in-person', label: 'In person' },
] as const;

export const BILLING = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'fixed', label: 'Fixed fee' },
  { value: 'quoted', label: 'Quoted per project' },
] as const;

export const AVAILABILITY = [
  { value: 'accepting', label: 'Taking new clients' },
  { value: 'limited', label: 'Limited availability' },
  { value: 'not', label: 'Not taking new clients' },
] as const;

export const CONTACT_PREFS = [
  { value: 'inquiry', label: 'LegalGrads request form' },
  { value: 'phone', label: 'Phone' },
  { value: 'website', label: 'My website' },
] as const;

export const labelFor = (list: readonly { value: string; label: string }[], value: string) => list.find((item) => item.value === value)?.label || '';

/** Each step counts the same. The meter only measures what the attorney has filled in. */
export function completeness(claim: Partial<OwnerClaim>): { percent: number; missing: string[] } {
  const steps: [string, boolean][] = [
    ['Add a photo', Boolean(claim.photoDataUrl)],
    ['Write a short bio', (claim.bio || '').trim().length >= 40],
    ['Pick your services', Boolean(claim.serviceList?.length || (claim.services || '').trim())],
    ['Choose who you work with', Boolean(claim.clientTypes?.length)],
    ['Describe consultations', Boolean(claim.consultModes?.length && claim.consultFee)],
    ['Explain how you bill', Boolean(claim.billing?.length)],
    ['Set your availability', Boolean(claim.availability)],
    ['Add a phone number or website', Boolean((claim.phone || '').replace(/\D/g, '').length >= 10 || /^https:\/\/\S+$/.test(claim.contactLink || ''))],
    ['Choose how clients reach you', Boolean(claim.contactPref)],
  ];
  const done = steps.filter(([, ok]) => ok).length;
  return { percent: Math.round((done / steps.length) * 100), missing: steps.filter(([, ok]) => !ok).map(([label]) => label) };
}

export function feeSummary(claim: Partial<OwnerClaim>): string {
  const parts = (claim.billing || []).map((value) => labelFor(BILLING, value)).filter(Boolean);
  return parts.length ? parts.join(', ') : 'Ask about fees';
}

export function consultSummary(claim: Partial<OwnerClaim>): string {
  const modes = (claim.consultModes || []).map((value) => labelFor(CONSULT_MODES, value)).filter(Boolean);
  if (!modes.length && !claim.consultFee) return '';
  const fee = claim.consultFee === 'free' ? 'Free' : claim.consultFee === 'paid' ? (claim.consultPrice ? `Paid (${claim.consultPrice})` : 'Paid') : '';
  return [fee, modes.join(', ')].filter(Boolean).join(' · ');
}

export function shortDate(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
}
