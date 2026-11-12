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
  /** True when the code went to the official bar email on file. The full address stays server side. */
  useBarEmail?: boolean;
  /** False while a claim waits for manual review. Edits stay hidden from the public until approved. */
  approved?: boolean;
  serviceList?: string[];
  clientTypes?: string[];
  consultModes?: string[];
  consultFee?: '' | 'free' | 'paid';
  consultPrice?: string;
  billing?: string[];
  fixedFees?: { service: string; price: string }[];
  availability?: '' | 'accepting' | 'limited' | 'not';
  availabilityUpdatedAt?: string;
  contactPref?: '' | 'phone' | 'website' | 'inquiry';
  inquiriesEnabled?: boolean;
}

/** Supabase public config: baked in at build time, or set on window by /js/supabase-public.js. */
export function publicSupabase(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) return { url: url.replace(/\/$/, ''), key };
  if (typeof window !== 'undefined') {
    const cfg = (window as unknown as { LEGALGRADS_SUPABASE?: { url?: string; key?: string } }).LEGALGRADS_SUPABASE;
    if (cfg?.url && cfg.key) return { url: String(cfg.url).replace(/\/$/, ''), key: String(cfg.key) };
  }
  return null;
}

export async function callFunction<T = ClaimApiResult>(name: string, body: Record<string, unknown>): Promise<T | null> {
  const cfg = publicSupabase();
  if (!cfg) return null;
  try {
    const response = await fetch(`${cfg.url}/functions/v1/${name}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: cfg.key, authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!data || typeof data !== 'object') return null;
    return data as T;
  } catch {
    return null;
  }
}

export interface ClaimOptions {
  barEmailMasked: string;
  firmDomain: string;
  lawSchoolDomain: string;
  claimed: boolean;
}

export const ATTESTATION = 'I confirm that I am this attorney.';
/** Checkbox text on the claim screen. Misuse rules live in the Attorney Terms. */
export const attestationFor = (name: string) => (name.trim() ? `I confirm that I am ${name.trim()}.` : ATTESTATION);
export const IDENTITY_NOTE = 'How we check: your confirmation code goes to your email, and we match the claim to the official bar record before your edits go public. If the email does not match, a person reviews the claim first.';

/** Bar numbers compare without case, hyphens, spaces, or leading zeros, matching the server rule. */
export function normalizeBarNumber(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^0+/, '');
}

export function barNumberMatches(listing: DirectoryListing, typed: string): boolean {
  const entered = normalizeBarNumber(typed);
  return entered.length > 0 && entered === normalizeBarNumber(listing.barNumber);
}

interface PendingClaim {
  profilePath: string;
  email: string;
  barTyped?: string;
  attest?: boolean;
  useBarEmail?: boolean;
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
  method?: string;
  approved?: boolean;
  barEmailMasked?: string;
  firmDomain?: string;
  lawSchoolDomain?: string;
  claimed?: boolean;
  textPending?: boolean;
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

export function welcomeEmail(input: { name: string; editUrl: string; approved?: boolean }): MailCopy {
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
      ...(input.approved === false
        ? ['Your claim is pending review because the email did not match the official bar record.', 'Your edits are saved but stay hidden from the public until we confirm the claim.']
        : ['Your claim matched the official bar record, so your edits show on your public profile.']),
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
  return callFunction<ClaimApiResult>('claim-notify', body);
}

function deliveryFailure(remote: ClaimApiResult | null): string {
  if (!remote) return 'The claim email service is not reachable, so no code was emailed.';
  if (remote.reason === 'live-mail-off') return 'Confirmation email is limited to Legalgrads test inboxes until live mail is turned on. Nothing was sent.';
  if (remote.reason === 'domain-not-verified') return 'The legalgrads.com sender is not verified in Resend yet, so no code was emailed.';
  if (remote.reason === 'missing-api-key') return 'Resend is not configured, so no code was emailed.';
  if (remote.reason === 'storage-not-ready') return 'Claim storage is not ready in Supabase yet, so no code was emailed.';
  if (remote.reason === 'rate-limit') return 'Too many codes were requested for this email in the last hour. Wait a little, then try again, or email ryan@legalgrads.com.';
  if (remote.reason === 'bar-mismatch') return 'That bar number does not match this profile.';
  if (remote.reason === 'no-bar-email') return 'The State Bar record has no email we can use. Choose "I no longer use that address" and enter your email.';
  if (remote.reason === 'bad-email') return 'Enter a valid email address.';
  if (remote.reason === 'suppressed') return 'This profile cannot be claimed online. Email ryan@legalgrads.com for help.';
  return 'We could not email a confirmation code.';
}

export async function fetchClaimOptions(profilePath: string): Promise<ClaimOptions> {
  const remote = await postClaim({ action: 'options', profilePath });
  return {
    barEmailMasked: remote?.barEmailMasked || '',
    firmDomain: remote?.firmDomain || '',
    lawSchoolDomain: remote?.lawSchoolDomain || '',
    claimed: Boolean(remote?.claimed),
  };
}

export async function reportWrongClaim(profilePath: string, reporterEmail: string, note: string): Promise<boolean> {
  const remote = await postClaim({ action: 'report', profilePath, reporterEmail: reporterEmail.trim(), note: note.trim() });
  return Boolean(remote?.ok);
}

export function reportHref(profilePath: string): string {
  return `/claim/?profile=${encodeURIComponent(profilePath)}&report=1`;
}

export async function requestClaimCode(listing: DirectoryListing, emailInput: string, options: { useBarEmail?: boolean; maskedBarEmail?: string; barTyped?: string; attest?: boolean } = {}): Promise<{
  ok: boolean;
  delivery?: 'email' | 'screen';
  code?: string;
  message: string;
}> {
  const useBarEmail = Boolean(options.useBarEmail);
  const email = useBarEmail ? (options.maskedBarEmail || 'bar email on file') : emailInput.trim().toLowerCase();
  if (!barNumberMatches(listing, options.barTyped || '')) return { ok: false, message: 'That bar number does not match this profile. Enter the bar number on your State Bar record.' };
  if (!options.attest) return { ok: false, message: 'Check the box to confirm you are this attorney.' };
  if (!useBarEmail && !validEmail(email)) return { ok: false, message: 'Enter a valid email address.' };
  const barTyped = (options.barTyped || '').trim();
  const remote = await postClaim({
    action: 'send-code',
    email: useBarEmail ? '' : email,
    useBarEmail,
    profilePath: listing.profilePath,
    name: listing.name,
    barNumber: barTyped,
    attest: true,
    stateCode: listing.stateCode,
    city: listing.city,
  });
  if (remote?.sent) {
    savePending({ profilePath: listing.profilePath, email, useBarEmail, barTyped, attest: true, mode: 'server', expiresAt: Date.now() + CODE_MS, listing });
    return {
      ok: true,
      delivery: 'email',
      message: `We emailed a confirmation code to ${email}. It expires in 30 minutes.`,
    };
  }
  if (!useBarEmail && isTestRecipient(email)) {
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
  approved?: boolean;
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
  let approved = true;
  if (pending.mode === 'server') {
    const remote = await postClaim({
      action: 'verify',
      email: pending.useBarEmail ? '' : pending.email,
      useBarEmail: Boolean(pending.useBarEmail),
      profilePath: listing.profilePath,
      code: entered,
      name: listing.name,
      barNumber: pending.barTyped || '',
      attest: Boolean(pending.attest),
      stateCode: listing.stateCode,
      city: listing.city,
    });
    if (remote?.reason === 'already-claimed') {
      clearPending();
      return { ok: false, message: 'This profile is already claimed. We saved your request for review. If this is your profile, use the bar email on file or report a wrong claim.' };
    }
    if (!remote) return { ok: false, message: 'We could not reach the claim service. Check your connection and try again.' };
    if (!remote.ok || !remote.claimToken) return { ok: false, message: 'That code does not match or has expired. Check the newest email, or send a new code.' };
    token = remote.claimToken;
    approved = remote.approved !== false;
  } else if (pending.code !== entered) {
    return { ok: false, message: 'That code does not match or has expired. Check the newest email, or send a new code.' };
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
    useBarEmail: Boolean(pending.useBarEmail),
    approved,
  };
  saveClaim(claim);
  clearPending();
  const welcome = welcomeEmail({ name: listing.name, editUrl, approved });
  const mailed = await postClaim({
    action: 'welcome',
    email: pending.useBarEmail ? '' : pending.email,
    useBarEmail: Boolean(pending.useBarEmail),
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
    approved,
    message: emailed
      ? `Welcome email sent from ${mailed?.from || CLAIM_FROM}.`
      : 'The welcome email was not sent. The message is shown here, and the edit link works.',
  };
}

export function ownerEditPayload(claim: OwnerClaim): Record<string, unknown> {
  return {
    bio: claim.bio,
    services: claim.services,
    phone: claim.phone,
    contactLink: claim.contactLink,
    practiceAreas: claim.practiceAreas,
    photoDataUrl: claim.photoDataUrl,
    fullName: claim.name,
    serviceList: claim.serviceList || [],
    clientTypes: claim.clientTypes || [],
    consultModes: claim.consultModes || [],
    consultFee: claim.consultFee || '',
    consultPrice: claim.consultPrice || '',
    billing: claim.billing || [],
    fixedFees: claim.fixedFees || [],
    availability: claim.availability || '',
    contactPref: claim.contactPref || '',
    inquiriesEnabled: claim.inquiriesEnabled !== false,
  };
}

function ownerAuth(claim: OwnerClaim): Record<string, unknown> {
  return { email: claim.useBarEmail ? '' : claim.email, useBarEmail: Boolean(claim.useBarEmail), profilePath: claim.profilePath, claimToken: claim.claimToken };
}

export async function saveOwnerEdit(claim: OwnerClaim): Promise<{ remote: boolean; ok: boolean; message: string; claim: OwnerClaim }> {
  saveClaim(claim);
  const remote = await callFunction<ClaimApiResult & { availabilityUpdatedAt?: string }>('owner-tools', { action: 'save', ...ownerAuth(claim), edit: ownerEditPayload(claim) });
  if (remote?.ok) {
    const next = { ...claim, availabilityUpdatedAt: remote.availabilityUpdatedAt || claim.availabilityUpdatedAt || '' };
    saveClaim(next);
    return {
      remote: true,
      ok: true,
      claim: next,
      message: claim.approved === false
        ? 'Submitted. Your claim is pending review, so these edits stay hidden from the public until we confirm it.'
        : remote.textPending
          ? 'Saved. Your bio and custom services wait for a quick review before they show. Everything else shows now.'
          : 'Saved. Your edits show on your public profile.',
    };
  }
  if (remote && remote.reason === 'bad-link') return { remote: true, ok: false, claim, message: 'The website must start with https://' };
  if (remote && remote.reason === 'bad-token') return { remote: true, ok: false, claim, message: 'Your sign-in on this device has expired. Claim the profile again to get a new code.' };
  return {
    remote: false,
    ok: true,
    claim,
    message: 'Saved on this device. The public page in this browser shows these edits. Claim storage in Supabase did not accept them yet.',
  };
}

export interface OwnerStats {
  since: string;
  views: number;
  websiteClicks: number;
  phoneClicks: number;
  inquiries: number;
}

export async function loadOwnerStats(claim: OwnerClaim): Promise<{ ok: boolean; stats?: OwnerStats; message: string }> {
  const remote = await callFunction<{ ok?: boolean; reason?: string } & Partial<OwnerStats>>('owner-tools', { action: 'dashboard', ...ownerAuth(claim) });
  if (!remote) return { ok: false, message: 'Stats need the LegalGrads server, which this page could not reach.' };
  if (!remote.ok) return { ok: false, message: remote.reason === 'bad-token' ? 'Your sign-in on this device has expired. Claim the profile again to see stats.' : 'Stats are not available right now.' };
  return {
    ok: true,
    message: '',
    stats: { since: remote.since || '', views: remote.views ?? 0, websiteClicks: remote.websiteClicks ?? 0, phoneClicks: remote.phoneClicks ?? 0, inquiries: remote.inquiries ?? 0 },
  };
}

export function dashboardHref(profilePath: string): string {
  return `/attorney/dashboard/?profile=${encodeURIComponent(profilePath)}`;
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

/** Reads a proof image (bar card or license, or a photo holding it) as a JPEG data URL up to 1600 px. */
export function readProofFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose a photo, not a PDF or screenshot file.'));
      return;
    }
    if (file.size > 20_000_000) {
      reject(new Error('Choose an image under 20 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not read that image.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadClaimProof(claim: OwnerClaim, cardImage: string, selfieImage: string): Promise<{ ok: boolean; message: string }> {
  const remote = await postClaim({
    action: 'proof',
    email: claim.useBarEmail ? '' : claim.email,
    useBarEmail: Boolean(claim.useBarEmail),
    profilePath: claim.profilePath,
    claimToken: claim.claimToken,
    cardImage,
    selfieImage,
  });
  if (remote?.ok) return { ok: true, message: 'Thanks. Your photos are stored privately for our reviewer and deleted once we decide on your claim.' };
  if (remote?.reason === 'already-approved') return { ok: false, message: 'Your claim is already approved. No photos are needed.' };
  return { ok: false, message: 'We could not upload those photos. Try again with clear photos under 5 MB.' };
}
