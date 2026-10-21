import { SPECIALTIES, specialtyName } from './catalog';
import { validEmail } from './format';
import { mailtoHref } from './mailto';
import { getSupabase } from './supabase';
import { supabaseConfigured } from './site';

export interface ApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  barNumber: string;
  admissionDate: string;
  practiceAreas: string[];
  citiesServed: string;
  bio: string;
  rateType: '' | 'flat' | 'hourly';
  rateAmount: string;
  languages: string;
  contactLink: string;
  photoName: string;
  malpractice: boolean;
  terms: boolean;
}

export const EMPTY_APPLICATION: ApplicationInput = {
  fullName: '',
  email: '',
  phone: '',
  barNumber: '',
  admissionDate: '',
  practiceAreas: [],
  citiesServed: '',
  bio: '',
  rateType: '',
  rateAmount: '',
  languages: '',
  contactLink: '',
  photoName: '',
  malpractice: false,
  terms: false,
};

const DRAFT_KEY = 'legalgrads-application';

export function saveDraft(input: ApplicationInput): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(input));
}

export function loadDraft(): ApplicationInput | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return { ...EMPTY_APPLICATION, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function stepError(step: number, input: ApplicationInput): string | null {
  if (step === 0) {
    if (input.fullName.trim().length < 2) return 'Enter your full name.';
    if (!validEmail(input.email)) return 'Enter a valid email address.';
    if (input.phone.replace(/\D/g, '').length < 10) return 'Enter a phone number with at least 10 digits.';
  }
  if (step === 1) {
    if (!/^\d{4,8}$/.test(input.barNumber.trim())) return 'Enter your California State Bar number (digits only).';
    if (!input.admissionDate) return 'Enter your admission date.';
  }
  if (step === 2 && input.practiceAreas.length === 0) return 'Choose at least one practice area.';
  if (step === 3) {
    if (input.citiesServed.trim().length < 2) return 'List the California cities you serve.';
    if (input.languages.trim().length < 2) return 'List the languages you work in.';
    if (input.bio.trim().length < 40) return 'Write a short bio of at least 40 characters.';
  }
  if (step === 4) {
    if (input.rateType !== 'flat' && input.rateType !== 'hourly') return 'Choose flat or hourly.';
    const amount = Number(input.rateAmount);
    if (!Number.isFinite(amount) || amount <= 0) return 'Enter the amount you charge.';
    if (!/^https:\/\/\S+$/i.test(normalizeLink(input.contactLink))) return 'Enter an https contact or booking link.';
  }
  if (step === 5) {
    if (!input.malpractice) return 'Confirm that you maintain malpractice insurance.';
    if (!input.terms) return 'Agree to the Attorney Terms to submit.';
  }
  return null;
}

export function normalizeLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
  return `https://${trimmed}`;
}

export function applicationBody(input: ApplicationInput): string {
  const areas = input.practiceAreas.map(specialtyName).join(', ');
  const rate = input.rateType === 'hourly' ? `$${input.rateAmount} per hour` : `$${input.rateAmount} flat`;
  return [
    'Founding Member application for Legalgrads.',
    '',
    `Name: ${input.fullName.trim()}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${input.phone.trim()}`,
    `California State Bar number: ${input.barNumber.trim()}`,
    `Admission date: ${input.admissionDate}`,
    `Practice areas: ${areas}`,
    `Cities served: ${input.citiesServed.trim()}`,
    `Languages: ${input.languages.trim()}`,
    `Rate: ${rate}`,
    `Contact / booking link: ${normalizeLink(input.contactLink)}`,
    `Malpractice insurance confirmed: ${input.malpractice ? 'yes' : 'no'}`,
    'Agreed to Attorney Terms: yes',
    `Photo: ${input.photoName ? `${input.photoName} (attach this file manually; it is not inside the link)` : 'none provided'}`,
    '',
    'Bio:',
    input.bio.trim(),
    '',
    'Listing requested only after manual California State Bar verification.',
  ].join('\n');
}

export function applicationMailto(input: ApplicationInput): string {
  return mailtoHref(`Legalgrads founding member application — ${input.fullName.trim()}`, applicationBody(input));
}

export interface SubmitResult {
  channel: 'supabase' | 'mailto';
  mailto: string;
  id?: string;
  error?: string;
}

export async function submitApplication(input: ApplicationInput, photo: File | null): Promise<SubmitResult> {
  const mailto = applicationMailto(input);
  if (!supabaseConfigured()) {
    return { channel: 'mailto', mailto, error: 'Supabase is not configured for this build, so nothing was stored on a server.' };
  }
  const supabase = getSupabase();
  if (!supabase) return { channel: 'mailto', mailto, error: 'Supabase client did not start.' };
  const id = crypto.randomUUID();
  let photoPath: string | null = null;
  try {
    if (photo) {
      const safe = photo.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
      photoPath = `pending/${id}/${safe}`;
      const uploaded = await supabase.storage.from('attorney-photos').upload(photoPath, photo, {
        contentType: photo.type || 'application/octet-stream',
        upsert: false,
      });
      if (uploaded.error) throw uploaded.error;
    }
    const inserted = await supabase.from('attorney_applications').insert({
      id,
      status: 'pending',
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      bar_number: input.barNumber.trim(),
      admission_date: input.admissionDate,
      practice_areas: input.practiceAreas,
      cities_served: input.citiesServed.trim(),
      bio: input.bio.trim(),
      rate_type: input.rateType,
      rate_amount: Number(input.rateAmount),
      languages: input.languages.trim(),
      contact_link: normalizeLink(input.contactLink),
      photo_path: photoPath,
      malpractice_insurance: true,
      attorney_terms_accepted_at: new Date().toISOString(),
    });
    if (inserted.error) throw inserted.error;
    return { channel: 'supabase', mailto, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The database rejected the application.';
    return { channel: 'mailto', mailto, error: `${message} Nothing was left only in the browser. Use the email link so every field is delivered.` };
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
  if (!supabaseConfigured()) {
    return { channel: 'mailto', mailto, error: 'Supabase is not configured, so this signup was not stored on a server.' };
  }
  const supabase = getSupabase();
  if (!supabase) return { channel: 'mailto', mailto };
  const inserted = await supabase.from('consumer_waitlist').insert({ email: email.trim(), source });
  if (inserted.error) {
    return { channel: 'mailto', mailto, error: `${inserted.error.message} Use the email link so the address is not lost.` };
  }
  return { channel: 'supabase', mailto };
}

export function areaOptions() {
  return SPECIALTIES;
}
