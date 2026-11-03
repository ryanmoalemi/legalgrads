import { validEmail } from './format';
import { SITE_URL } from './site';

/** Confirmation codes are emailed. Legalgrads has no physical mailer and no State Bar mailing address. */
export const CLAIM_FROM = 'Legalgrads <hello@legalgrads.com>';
export const TEST_RECIPIENTS = ['ryan@legalgrads.com', 'aftermarketproducts71@gmail.com'] as const;
export const CLAIMS_KEY = 'legalgrads-owner-claims';
export const PENDING_KEY = 'legalgrads-claim-pending';
const CODE_MS = 30 * 60 * 1000;
const PROFILE_PATH = /^\/attorneys\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/$/;

export interface DirectoryListing {
  profilePath: string;
  name: string;
  barNumber: string;
  city: string;
  stateCode: string;
  admitted: string;
}

export interface MailCopy {
  from: string;
  subject: string;
  text: string;
}

export interface OwnerClaim {
  profilePath: string;
  email: string;
  name: string;
  barNumber: string;
  stateCode: string;
  city: string;
  claimedAt: string;
  claimToken: string;
  photoDataUrl: string;
  bio: string;
  services: string;
  phone: string;
  contactLink: string;
  practiceAreas: string[];
}

interface PendingClaim {
  profilePath: string;
  email: string;
  mode: 'local' | 'server';
  code?: string;
  expiresAt: number;
  listing: DirectoryListing;
}

export interface ClaimApiResult {
  ok?: boolean;
  sent?: boolean;
  reason?: string;
  claimToken?: string;
  from?: string;
  edit?: {
    bio?: string;
    services?: string;
    phone?: string;
    contactLink?: string;
    practiceAreas?: string[];
    photoDataUrl?: string;
    fullName?: string;
  };
}

export function claimHref(profilePath: string): string {
  return `/claim/?profile=${encodeURIComponent(profilePath)}`;
}

export function removalHref(profilePath: string): string {
  return `/data-deletion/?profile=${encodeURIComponent(profilePath)}`;
}

export function editorHref(profilePath: string): string {
  return `/attorney/profile/?profile=${encodeURIComponent(profilePath)}`;
}

export function editorAbsolute(profilePath: string): string {
  return `${SITE_URL}${editorHref(profilePath)}`;
}

export function normalizeProfilePath(value: string | null | undefined): string | null {
  if (!value) return null;
  let path = value.trim();
  if (path.includes('%')) {
    try {
      path = decodeURIComponent(path);
    } catch {
      return null;
    }
  }
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.endsWith('/')) path = `${path}/`;
  path = path.toLowerCase();
  return PROFILE_PATH.test(path) ? path : null;
}

export function isTestRecipient(email: string): boolean {
  return (TEST_RECIPIENTS as readonly string[]).includes(email.trim().toLowerCase());
}

export function listingFromDirectoryRow(row: {
  id?: string;
  n?: string;
  c?: string;
  a?: string;
  u?: string;
  s?: string;
}): DirectoryListing | null {
  const profilePath = normalizeProfilePath(row.u);
  const name = (row.n || '').trim();
  const barNumber = (row.id || '').trim();
  if (!profilePath || name.length < 2 || !barNumber) return null;
  return {
    profilePath,
    name,
    barNumber,
    city: (row.c || '').trim(),
    stateCode: (row.s || 'CA').trim().toUpperCase(),
    admitted: (row.a || '').trim(),
  };
}

export function makeClaimCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(100000 + (n % 900000));
}

export function makeClaimToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function verificationEmail(input: { name: string; code: string; profilePath: string }): MailCopy {
  return {
    from: CLAIM_FROM,
    subject: 'Your Legalgrads confirmation code',
    text: [
      `Hello ${input.name},`,
      '',
      `Your Legalgrads confirmation code is ${input.code}.`,
      '',
      'Enter this code on the claim page to confirm this listing is yours.',
      'The code expires in 30 minutes.',
      '',
      `Listing: ${SITE_URL}${input.profilePath}`,
    ].join('\n'),
  };
}

export function welcomeEmail(input: { name: string; editUrl: string }): MailCopy {
  return {
    from: CLAIM_FROM,
    subject: 'Your Legalgrads profile is claimed',
    text: [
      `Hello ${input.name},`,
      '',
      'You claimed your free Legalgrads profile.',
      'You can add a photo, a short bio, services, contact info, and practice areas.',
      '',
      `Edit your profile: ${input.editUrl}`,
      '',
      'The confirmation code signs you in on this device.',
      'Your edits show on the public page in this browser and stay in your editor.',
      'A later directory import keeps profiles that are marked claimed or owner-edited.',
    ].join('\n'),
  };
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadClaim(profilePath: string): OwnerClaim | null {
  const all = readJson<Record<string, OwnerClaim>>(CLAIMS_KEY) || {};
  return all[profilePath] || null;
}

export function saveClaim(claim: OwnerClaim): void {
  if (typeof window === 'undefined') return;
  const all = readJson<Record<string, OwnerClaim>>(CLAIMS_KEY) || {};
  all[claim.profilePath] = claim;
  window.localStorage.setItem(CLAIMS_KEY, JSON.stringify(all));
}

function loadPending(): PendingClaim | null {
  const pending = readJson<PendingClaim>(PENDING_KEY);
  if (!pending || pending.expiresAt < Date.now()) return null;
  return pending;
}

function savePending(pending: PendingClaim): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

function clearPending(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_KEY);
}

async function postClaim(body: Record<string, unknown>): Promise<ClaimApiResult | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/functions/v1/claim-notify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: key,
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!data || typeof data !== 'object') return null;
    return data as ClaimApiResult;
  } catch {
    return null;
  }
}

function deliveryFailure(remote: ClaimApiResult | null): string {
  if (!remote) return 'The claim email service is not reachable, so no code was emailed.';
  if (remote.reason === 'live-mail-off') return 'Confirmation email is limited to Legalgrads test inboxes until live mail is turned on. Nothing was sent.';
  if (remote.reason === 'domain-not-verified') return 'The legalgrads.com sender is not verified in Resend yet, so no code was emailed.';
  if (remote.reason === 'missing-api-key') return 'Resend is not configured, so no code was emailed.';
  if (remote.reason === 'storage-not-ready') return 'Claim storage is not ready in Supabase yet, so no code was emailed.';
  return 'We could not email a confirmation code.';
}

export async function requestClaimCode(listing: DirectoryListing, emailInput: string): Promise<{
  ok: boolean;
  delivery?: 'email' | 'screen';
  code?: string;
  message: string;
}> {
  const email = emailInput.trim().toLowerCase();
  if (!validEmail(email)) return { ok: false, message: 'Enter a valid email address.' };
  const remote = await postClaim({
    action: 'send-code',
    email,
    profilePath: listing.profilePath,
    name: listing.name,
    barNumber: listing.barNumber,
    stateCode: listing.stateCode,
    city: listing.city,
  });
  if (remote?.sent) {
    savePending({ profilePath: listing.profilePath, email, mode: 'server', expiresAt: Date.now() + CODE_MS, listing });
    return {
      ok: true,
      delivery: 'email',
      message: `We emailed a confirmation code to ${email}. It expires in 30 minutes.`,
    };
  }
  if (isTestRecipient(email)) {
    const code = makeClaimCode();
    savePending({ profilePath: listing.profilePath, email, mode: 'local', code, expiresAt: Date.now() + CODE_MS, listing });
    const why = remote?.reason === 'live-mail-off'
      ? 'Live email is off, so this test inbox shows the code here.'
      : 'Email delivery is not available, so this test inbox shows the code here.';
    return { ok: true, delivery: 'screen', code, message: why };
  }
  return { ok: false, message: deliveryFailure(remote) };
}

export function pendingFor(profilePath: string): { email: string; code?: string; mode: 'local' | 'server' } | null {
  const pending = loadPending();
  if (!pending || pending.profilePath !== profilePath) return null;
  return { email: pending.email, code: pending.mode === 'local' ? pending.code : undefined, mode: pending.mode };
}

export async function confirmClaimCode(listing: DirectoryListing, codeInput: string): Promise<{
  ok: boolean;
  message: string;
  editUrl?: string;
  welcome?: MailCopy;
  emailed?: boolean;
}> {
  const pending = loadPending();
  if (!pending || pending.profilePath !== listing.profilePath) {
    return { ok: false, message: 'Request a confirmation code first.' };
  }
  if (pending.expiresAt < Date.now()) {
    clearPending();
    return { ok: false, message: 'That code expired. Request a new one.' };
  }
  const entered = codeInput.trim();
  if (!/^\d{6}$/.test(entered)) return { ok: false, message: 'Enter the 6 digit code.' };
  let token = '';
  if (pending.mode === 'server') {
    const remote = await postClaim({
      action: 'verify',
      email: pending.email,
      profilePath: listing.profilePath,
      code: entered,
      name: listing.name,
      barNumber: listing.barNumber,
      stateCode: listing.stateCode,
      city: listing.city,
    });
    if (!remote?.ok || !remote.claimToken) return { ok: false, message: 'That code does not match.' };
    token = remote.claimToken;
  } else if (pending.code !== entered) {
    return { ok: false, message: 'That code does not match.' };
  } else {
    token = makeClaimToken();
  }
  const editUrl = editorAbsolute(listing.profilePath);
  const claim: OwnerClaim = {
    profilePath: listing.profilePath,
    email: pending.email,
    name: listing.name,
    barNumber: listing.barNumber,
    stateCode: listing.stateCode,
    city: listing.city,
    claimedAt: new Date().toISOString(),
    claimToken: token,
    photoDataUrl: '',
    bio: '',
    services: '',
    phone: '',
    contactLink: '',
    practiceAreas: [],
  };
  saveClaim(claim);
  clearPending();
  const welcome = welcomeEmail({ name: listing.name, editUrl });
  const mailed = await postClaim({
    action: 'welcome',
    email: pending.email,
    profilePath: listing.profilePath,
    name: listing.name,
    claimToken: token,
  });
  const emailed = Boolean(mailed?.sent);
  return {
    ok: true,
    editUrl,
    welcome,
    emailed,
    message: emailed
      ? `Welcome email sent from ${mailed?.from || CLAIM_FROM}.`
      : 'The welcome email was not sent. The message is shown here, and the edit link works.',
  };
}

export async function saveOwnerEdit(claim: OwnerClaim): Promise<{ remote: boolean; message: string }> {
  saveClaim(claim);
  const remote = await postClaim({
    action: 'save',
    email: claim.email,
    profilePath: claim.profilePath,
    claimToken: claim.claimToken,
    edit: {
      bio: claim.bio,
      services: claim.services,
      phone: claim.phone,
      contactLink: claim.contactLink,
      practiceAreas: claim.practiceAreas,
      photoDataUrl: claim.photoDataUrl,
      fullName: claim.name,
    },
  });
  if (remote?.ok) {
    return { remote: true, message: 'Saved on this device and in Legalgrads claim storage.' };
  }
  return {
    remote: false,
    message: 'Saved on this device. The public page in this browser shows these edits. Claim storage in Supabase did not accept them yet.',
  };
}

export function readPhotoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file.'));
      return;
    }
    if (file.size > 8_000_000) {
      reject(new Error('Choose an image under 8 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.onload = () => {
        const scale = Math.min(1, 480 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not read that image.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const url = canvas.toDataURL('image/jpeg', 0.82);
        if (url.length > 180_000) {
          reject(new Error('That photo is still too large. Try a smaller image.'));
          return;
        }
        resolve(url);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}
