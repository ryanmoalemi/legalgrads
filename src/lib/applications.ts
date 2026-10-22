import { SPECIALTIES, specialtyName } from './catalog';
import { validEmail } from './format';
import { mailtoHref } from './mailto';
import { getSupabase } from './supabase';
import { supabaseConfigured } from './site';
import { stateName, US_STATES } from './states';

export const STEP_IDS = ['you', 'license', 'areas', 'practice', 'review'] as const;
export const DRAFT_KEY = 'legalgrads-apply-draft';
export const BIO_EXAMPLE = 'I help Oakland clients with leases and everyday contracts. I was admitted to the bar in 2025.';
export const BAR_SEARCH_URL = 'https://www.americanbar.org/groups/legal_services/flh-home/flh-bar-directories-and-lawyer-finders/';

export type Visibility = '' | 'public' | 'private';
export type InsuranceChoice = '' | 'insured' | 'will_disclose';

export interface ApplicationInput {
  fullName: string;
  email: string;
  emailPublic: Visibility;
  phone: string;
  phonePublic: Visibility;
  licensedState: string;
  barNumber: string;
  admissionDate: string;
  practiceAreas: string[];
  citiesServed: string;
  bio: string;
  freeConsultation: boolean;
  languages: string;
  contactLink: string;
  photoName: string;
  insurance: InsuranceChoice;
  terms: boolean;
}

export const EMPTY_APPLICATION: ApplicationInput = {
  fullName: '',
  email: '',
  emailPublic: '',
  phone: '',
  phonePublic: 'private',
  licensedState: '',
  barNumber: '',
  admissionDate: '',
  practiceAreas: [],
  citiesServed: '',
  bio: '',
  freeConsultation: false,
  languages: '',
  contactLink: '',
  photoName: '',
  insurance: '',
  terms: false,
};

export interface StoredDraft {
  input: ApplicationInput;
  photoDataUrl: string;
}

export function loadDraft(): StoredDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredDraft;
    return { input: { ...EMPTY_APPLICATION, ...parsed.input }, photoDataUrl: parsed.photoDataUrl || '' };
  } catch {
    return null;
  }
}

export function saveDraft(draft: StoredDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ input: draft.input, photoDataUrl: '' }));
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function isFutureDate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return true;
  const admitted = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return admitted > today;
}

export function contactProblem(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return 'That contact method is not allowed.';
  if (validEmail(trimmed)) return 'Use an https link. Your email stays private.';
  if (/^https:\/\/\S+$/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol === 'https:' && url.hostname.includes('.')) return null;
    } catch {
      return 'Enter a full https link, or leave this blank.';
    }
  }
  return 'Enter a full https link, or leave this blank.';
}

export function contactHref(value: string): string {
  const trimmed = value.trim();
  if (/^[+\d().\-\s]+$/.test(trimmed)) return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
  return trimmed;
}

/** Public pages may link a booking URL or a phone number. Never an email address. */
export function publicContactHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || validEmail(trimmed) || /^(javascript|data|vbscript):/i.test(trimmed)) return null;
  if (/^[+\d().\-\s]+$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 10) {
    return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
  }
  if (/^https:\/\/\S+$/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol === 'https:' && url.hostname.includes('.')) return trimmed;
    } catch {
      return null;
    }
  }
  return null;
}

export const PHONE_HINT = 'Required so we can reach you about your application and state bar check. Private unless you choose to show it on your listing.';
export const PHONE_ERROR = 'Enter a 10-digit US phone number.';

/** Formats a US number as (555) 555-5555 while the attorney types. A leading 1 is dropped once 11 digits are present. */
export function formatUsPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length >= 11 && digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Ten US digits. Spaces, dashes, parentheses, and a leading 1 are allowed. */
export function phoneProblem(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (national.length !== 10) return PHONE_ERROR;
  return null;
}

export function errorsForStep(step: number, input: ApplicationInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (input.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
    if (!validEmail(input.email)) errors.email = 'Enter a valid email address.';
    const phone = phoneProblem(input.phone);
    if (phone) errors.phone = phone;
  }
  if (step === 1) {
    if (!US_STATES.some((s) => s.code === input.licensedState)) errors.licensedState = 'Choose the state where you are licensed.';
    if (!/^[A-Za-z0-9]{1,12}$/.test(input.barNumber)) errors.barNumber = 'Use letters and digits only, up to 12.';
    if (!input.admissionDate) errors.admissionDate = 'Enter your admission date.';
    else if (isFutureDate(input.admissionDate)) errors.admissionDate = 'Admission date cannot be in the future.';
  }
  if (step === 2 && input.practiceAreas.length === 0) errors.practiceAreas = 'Choose at least one practice area.';
  if (step === 3) {
    if (input.citiesServed.trim().length < 2) errors.citiesServed = 'List the cities you serve.';
    if (input.languages.trim().length < 2) errors.languages = 'List the languages you work in.';
    if (input.bio.trim().length < 40) errors.bio = 'Write at least 40 characters.';
    else if (input.bio.length > 600) errors.bio = 'Keep the bio to 600 characters.';
  }
  if (step === 4) {
    if (input.phonePublic !== 'public' && input.phonePublic !== 'private') errors.phonePublic = 'Choose whether clients can see your phone number.';
    const contact = contactProblem(input.contactLink);
    if (contact) errors.contactLink = contact;
    if (input.insurance !== 'insured' && input.insurance !== 'will_disclose') errors.insurance = 'Choose one option about professional liability insurance.';
    if (!input.terms) errors.terms = 'Agree to the Attorney Terms to submit.';
  }
  return errors;
}

export function insuranceLabel(choice: InsuranceChoice): string {
  if (choice === 'insured') return 'I carry professional liability insurance';
  if (choice === 'will_disclose') return "I don't. I'll tell clients in writing if my state's rules require it.";
  return 'Not chosen';
}

export function applicationBody(input: ApplicationInput, reference: string): string {
  const areas = input.practiceAreas.map(specialtyName).join(', ');
  return [
    'Free listing application for Legalgrads.',
    `Reference: ${reference}`,
    '',
    `Name: ${input.fullName.trim()}`,
    `Email: ${input.email.trim()}`,
    'Email on public listing: no',
    `Phone: ${input.phone.trim()}`,
    `Phone on public listing: ${input.phonePublic === 'public' ? 'yes' : 'no'}`,
    `State of licensure: ${stateName(input.licensedState)} (${input.licensedState})`,
    `Bar number: ${input.barNumber}`,
    `Admission date: ${input.admissionDate}`,
    `Practice areas: ${areas}`,
    `Cities served: ${input.citiesServed.trim()}`,
    `Languages: ${input.languages.trim()}`,
    `Free consultation: ${input.freeConsultation ? 'yes' : 'no'}`,
    `Website: ${input.contactLink.trim() || 'none'}`,
    `Insurance: ${insuranceLabel(input.insurance)}`,
    'Agreed to Attorney Terms: yes',
    `Photo: ${input.photoName ? `${input.photoName} (attach this file manually; it is not inside the link)` : 'none provided'}`,
    '',
    'Bio:',
    input.bio.trim(),
    '',
    'Listing requested only after manual state bar verification.',
  ].join('\n');
}

export function applicationMailto(input: ApplicationInput, reference: string): string {
  return mailtoHref(`Legalgrads free listing application ${reference}`, applicationBody(input, reference));
}

export interface SubmitResult {
  channel: 'supabase' | 'mailto';
  mailto: string;
  reference: string;
  name: string;
  insured: boolean;
  message: string;
  joinedYear?: number;
}

export function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `LG-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

const STORED_OFFLINE = 'We could not store this on the site. Nothing was discarded. Email us your application and include your reference number.';

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File | null> {
  if (!dataUrl) return null;
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], name || 'photo.jpg', { type: blob.type || 'image/jpeg' });
}

export async function submitApplication(input: ApplicationInput, photo: File | null): Promise<SubmitResult> {
  const reference = makeReference();
  const mailto = applicationMailto(input, reference);
  const joinedYear = new Date().getFullYear();
  const base = { mailto, reference, name: input.fullName.trim(), insured: input.insurance === 'insured', joinedYear };
  if (!supabaseConfigured()) {
    return { ...base, channel: 'mailto', message: STORED_OFFLINE };
  }
  const supabase = getSupabase();
  if (!supabase) return { ...base, channel: 'mailto', message: STORED_OFFLINE };
  const id = crypto.randomUUID();
  let photoPath: string | null = null;
  try {
    if (photo) {
      const safe = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      photoPath = `pending/${id}/${safe}`;
      const uploaded = await supabase.storage.from('attorney-photos').upload(photoPath, photo, {
        contentType: photo.type || 'image/jpeg',
        upsert: false,
      });
      if (uploaded.error) throw new Error('upload');
    }
    const row = {
      id,
      status: 'pending',
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      email_public: false,
      phone: input.phone.trim(),
      phone_public: input.phonePublic === 'public',
      bar_number: input.barNumber,
      admission_date: input.admissionDate,
      practice_areas: input.practiceAreas,
      cities_served: input.citiesServed.trim(),
      bio: input.bio.trim(),
      free_consultation: input.freeConsultation,
      languages: input.languages.trim(),
      contact_link: input.contactLink.trim(),
      photo_path: photoPath,
      insurance_choice: input.insurance,
      reference,
      attorney_terms_accepted_at: new Date().toISOString(),
    };
    const full = { ...row, licensed_state: input.licensedState };
    let inserted = await supabase.from('attorney_applications').insert(full);
    // Until the nullable-rate migration runs, the rate columns are still required. Store a private
    // placeholder that is never shown (listings no longer display rates).
    if (inserted.error && /rate_/i.test(inserted.error.message ?? '')) {
      inserted = await supabase.from('attorney_applications').insert({ ...full, rate_type: 'flat', rate_amount: 25, rate_for: 'not collected', rate_starting_at: false });
    }
    if (inserted.error) throw new Error('insert');
    return {
      ...base,
      channel: 'supabase',
      message: "We'll verify your state bar record within 2 business days and email you.",
    };
  } catch {
    return { ...base, channel: 'mailto', message: STORED_OFFLINE };
  }
}

export function waitlistMailto(email: string, source: string): string {
  return mailtoHref(
    'Legalgrads consumer waitlist',
    `Please add this address to the Legalgrads consumer waitlist.\n\nEmail: ${email.trim()}\nSource: ${source}\n`,
  );
}

export async function submitWaitlist(email: string, source: string): Promise<SubmitResult> {
  const mailto = waitlistMailto(email, source);
  const reference = makeReference();
  if (!supabaseConfigured()) {
    return { channel: 'mailto', mailto, reference, name: '', insured: false, message: 'We could not store this on the site. Email us so your address is not lost.' };
  }
  const supabase = getSupabase();
  if (!supabase) {
    return { channel: 'mailto', mailto, reference, name: '', insured: false, message: 'We could not store this on the site. Email us so your address is not lost.' };
  }
  const inserted = await supabase.from('consumer_waitlist').insert({ email: email.trim(), source });
  if (inserted.error) {
    return { channel: 'mailto', mailto, reference, name: '', insured: false, message: 'We could not store this on the site. Email us so your address is not lost.' };
  }
  return { channel: 'supabase', mailto, reference, name: '', insured: false, message: 'Saved.' };
}
