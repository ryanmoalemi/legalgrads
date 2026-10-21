import { DEMO_IDS, DEMO_TODAY, REVIEW_EDIT_HOURS, SEED_VERSION } from './catalog';
import { demoHash, nowIso, uid, withinWindow } from './format';
import { isBookable, searchAttorneys, toCard } from './search';
import { buildSeed } from './seed';
import type {
  Actor,
  Appointment,
  AttorneyCard,
  AttorneyProfile,
  DBState,
  Inquiry,
  Matter,
  Proposal,
  SearchFilters,
  Service,
  User,
} from './types';

export class AccessDeniedError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

const DB_NAME = 'legalgrads-demo';
const DB_VERSION = 1;
const SESSION_KEY = 'legalgrads-session';
const STATE_KEY = 'legalgrads-db';

let state: DBState | null = null;
let initPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
let persistQueue: Promise<void> = Promise.resolve();
let pendingSnapshot: DBState | null = null;

function requireState(): DBState {
  if (!state) throw new Error('Demo database is not ready.');
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readLocal(): DBState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DBState;
    if (parsed && parsed.seedVersion === SEED_VERSION && parsed.users?.length) return parsed;
  } catch {
    return null;
  }
  return null;
}

function persistSnapshot(snapshot: DBState): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(snapshot));
    } catch {
      // Private mode or quota. IndexedDB still receives the latest snapshot.
    }
  }
  pendingSnapshot = snapshot;
  persistQueue = persistQueue
    .then(async () => {
      const latest = pendingSnapshot;
      if (!latest) return;
      pendingSnapshot = null;
      await idbSet(latest);
    })
    .catch(() => undefined);
}

function emit(): void {
  const snapshot = structuredClone(requireState());
  persistSnapshot(snapshot);
  listeners.forEach((listener) => listener());
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(): Promise<DBState | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly');
    const request = tx.objectStore('kv').get('state');
    request.onsuccess = () => resolve((request.result as DBState | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(value: DBState): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, 'state');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const local = readLocal();
      if (local) {
        state = local;
        persistSnapshot(local);
        return;
      }
      try {
        const existing = await idbGet();
        if (existing && existing.seedVersion === SEED_VERSION && existing.users?.length) {
          state = existing;
          persistSnapshot(existing);
          return;
        }
      } catch {
        // IndexedDB unavailable. Fall through to a fresh seed.
      }
      state = buildSeed();
      persistSnapshot(state);
      await persistQueue;
    })();
  }
  return initPromise;
}

export async function resetDemo(): Promise<void> {
  await initDb();
  state = buildSeed();
  persistSnapshot(state);
  await persistQueue;
  listeners.forEach((listener) => listener());
}

export function getState(): DBState {
  return requireState();
}

export function readSession(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function writeSession(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId) window.localStorage.setItem(SESSION_KEY, userId);
  else window.localStorage.removeItem(SESSION_KEY);
}

function actorOf(user: User | null): Actor | null {
  if (!user || user.deletedAt) return null;
  return { id: user.id, role: user.role };
}

export function currentActor(): Actor | null {
  const id = readSession();
  if (!id || !state) return null;
  return actorOf(state.users.find((u) => u.id === id) ?? null);
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new AccessDeniedError('Sign in to continue.');
  return actor;
}

function log(actorId: string, objectType: string, objectId: string, action: string, summary: string): void {
  requireState().activityEvents.unshift({
    id: uid('act'),
    actorId,
    objectType,
    objectId,
    action,
    summary,
    createdAt: nowIso(),
  });
}

function notify(userId: string, type: string, body: string, href: string): void {
  requireState().notifications.unshift({
    id: uid('nt'),
    userId,
    type,
    body: `Simulated alert (not emailed): ${body}`,
    readAt: null,
    createdAt: nowIso(),
    href,
  });
}

function userById(id: string): User | undefined {
  return requireState().users.find((u) => u.id === id && !u.deletedAt);
}

export function getUser(id: string): User | null {
  return userById(id) ?? null;
}

export function publicAttorneys(filters: SearchFilters = {}): AttorneyCard[] {
  return searchAttorneys(requireState(), filters);
}

export function attorneyBySlug(slug: string): AttorneyCard | null {
  const profile = requireState().attorneyProfiles.find((p) => p.slug === slug);
  return profile ? toCard(requireState(), profile.userId) : null;
}

export function servicesFor(attorneyId: string): Service[] {
  return requireState().services.filter((s) => s.attorneyId === attorneyId && s.active);
}

export function allServicesFor(actor: Actor | null, attorneyId: string): Service[] {
  const actorOk = requireActor(actor);
  if (actorOk.role !== 'admin' && actorOk.id !== attorneyId) throw new AccessDeniedError();
  return requireState().services.filter((s) => s.attorneyId === attorneyId);
}

export function openSlots(attorneyId: string) {
  const now = new Date(DEMO_TODAY).getTime();
  return requireState().availabilitySlots.filter(
    (slot) => slot.attorneyId === attorneyId && new Date(slot.startAtUtc).getTime() > now,
  );
}

export function reviewsFor(attorneyId: string) {
  return requireState().reviews.filter((r) => r.attorneyId === attorneyId && r.moderation === 'visible');
}

export function login(email: string, password: string): User {
  const db = requireState();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && !u.deletedAt);
  if (!user || user.passwordHash !== demoHash(password) || user.role === 'system') {
    throw new Error('Email or password does not match a demo account.');
  }
  log(user.id, 'user', user.id, 'login', `${user.name} signed in (demo).`);
  emit();
  return user;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'attorney';
  acceptTerms: boolean;
  adult: boolean;
  state: string;
}): User {
  const db = requireState();
  if (!input.adult) throw new Error('This demo is for adults 18 and older.');
  if (!input.acceptTerms) throw new Error('Accept the draft terms to create an account.');
  if (input.password.length < 8) throw new Error('Use at least 8 characters. This is not a production password rule.');
  const email = input.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === email && !u.deletedAt)) {
    throw new Error('That email is already used in this browser’s demo data.');
  }
  const id = uid('user');
  const user: User = {
    id,
    role: input.role,
    name: input.name.trim(),
    email,
    passwordHash: demoHash(input.password),
    createdAt: nowIso(),
    emailVerified: false,
    adultConfirmed: true,
    deletedAt: null,
  };
  db.users.push(user);
  db.termsAcceptances.push({ id: uid('terms'), userId: id, version: db.settings.termsVersion, acceptedAt: nowIso() });
  if (input.role === 'client') {
    db.clientProfiles.push({ userId: id, location: '', state: input.state, preferences: '' });
  } else {
    db.attorneyProfiles.push({
      userId: id,
      slug: `new-${id.slice(-6)}`,
      displayName: input.name.trim(),
      firstName: input.name.trim().split(' ')[0] || 'Attorney',
      bio: '',
      lawSchool: '',
      graduationYear: new Date(DEMO_TODAY).getUTCFullYear(),
      admissionDate: null,
      licenseJurisdictions: input.state ? [input.state] : [],
      licenseStatus: 'not_admitted',
      verificationStatus: 'pending',
      verificationDate: null,
      hourlyRate: 0,
      photoUrl: '/headshots/12_nicole.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: false,
      isPublished: false,
      city: '',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 24,
      cardTags: [],
    });
  }
  log(id, 'user', id, 'register', `${user.name} created a demo ${user.role} account and accepted terms ${db.settings.termsVersion}.`);
  emit();
  return user;
}

export function verifyEmailDemo(actor: Actor | null): void {
  const me = requireActor(actor);
  const user = userById(me.id);
  if (!user) throw new NotFoundError();
  user.emailVerified = true;
  log(me.id, 'user', me.id, 'verify_email', 'Email marked verified inside the demo. No email was sent.');
  emit();
}

export function requestPasswordReset(email: string): { token: string } {
  const db = requireState();
  const token = uid('reset');
  db.passwordResets.push({ id: uid('pr'), email: email.trim().toLowerCase(), token, createdAt: nowIso(), usedAt: null });
  log(DEMO_IDS.system, 'password_reset', token, 'requested', 'Simulated password reset created. No email was sent.');
  emit();
  return { token };
}

export function resetPassword(email: string, token: string, password: string): void {
  const db = requireState();
  if (password.length < 8) throw new Error('Use at least 8 characters.');
  const row = db.passwordResets.find((r) => r.token === token && r.email === email.trim().toLowerCase() && !r.usedAt);
  if (!row) throw new Error('That demo reset token does not match.');
  const user = db.users.find((u) => u.email.toLowerCase() === row.email && !u.deletedAt);
  if (!user) throw new Error('No demo account uses that email.');
  user.passwordHash = demoHash(password);
  row.usedAt = nowIso();
  log(user.id, 'user', user.id, 'password_reset', 'Demo password updated. No email was sent.');
  emit();
}

export function acceptTerms(actor: Actor | null): void {
  const me = requireActor(actor);
  const db = requireState();
  db.termsAcceptances.push({ id: uid('terms'), userId: me.id, version: db.settings.termsVersion, acceptedAt: nowIso() });
  log(me.id, 'terms', db.settings.termsVersion, 'accepted', `Accepted draft terms ${db.settings.termsVersion}.`);
  emit();
}

export function latestTerms(userId: string): { version: string; acceptedAt: string } | null {
  const rows = requireState().termsAcceptances.filter((t) => t.userId === userId);
  return rows.length ? rows[rows.length - 1] : null;
}

export function needsReconsent(userId: string): boolean {
  const latest = latestTerms(userId);
  return !latest || latest.version !== requireState().settings.termsVersion;
}

function assertBookable(attorneyId: string): void {
  if (!isBookable(requireState(), attorneyId)) {
    throw new Error('That attorney is not available for hire in this demo.');
  }
}

function assertJurisdiction(attorneyId: string, jurisdiction: string): void {
  const profile = requireState().attorneyProfiles.find((p) => p.userId === attorneyId);
  if (!profile || !jurisdiction) throw new Error('Choose a jurisdiction the attorney is licensed in.');
  if (!profile.licenseJurisdictions.includes(jurisdiction)) {
    throw new Error('This attorney is not licensed in that jurisdiction, so the demo will not open a matter there.');
  }
}

const PRIVACY = 'Privacy notice: do not share privileged or highly sensitive facts in this marketplace thread. Sending a message does not create an attorney-client relationship.';

export function createInquiry(
  actor: Actor | null,
  input: {
    attorneyId: string;
    specialtyId: string;
    serviceId?: string | null;
    kind: Inquiry['kind'];
    description: string;
    budget: string;
    urgency: string;
    jurisdiction: string;
    contactPreference: string;
    durationMinutes: number;
    slotId?: string | null;
  },
): Inquiry {
  const me = requireActor(actor);
  if (me.role !== 'client') throw new AccessDeniedError('Only a client can open an inquiry.');
  const db = requireState();
  assertBookable(input.attorneyId);
  assertJurisdiction(input.attorneyId, input.jurisdiction);
  if (!input.description.trim()) throw new Error('Add a short, non-confidential description.');
  const specialty = db.specialties.find((s) => s.id === input.specialtyId);
  if (!specialty) throw new Error('Choose a practice area.');
  const linked = db.attorneySpecialties.some((row) => row.attorneyId === input.attorneyId && row.specialtyId === specialty.id);
  if (!linked) throw new Error('That attorney does not list this practice area.');
  const inquiry: Inquiry = {
    id: uid('inq'),
    clientId: me.id,
    attorneyId: input.attorneyId,
    specialtyId: specialty.id,
    serviceId: input.serviceId ?? null,
    kind: input.kind,
    description: input.description.trim(),
    budget: input.budget,
    urgency: input.urgency,
    jurisdiction: input.jurisdiction,
    contactPreference: input.contactPreference,
    durationMinutes: input.durationMinutes,
    status: 'inquiry',
    createdAt: nowIso(),
  };
  db.inquiries.unshift(inquiry);
  const convo = { id: uid('convo'), inquiryId: inquiry.id, matterId: null };
  db.conversations.unshift(convo);
  db.conversationMembers.push({ conversationId: convo.id, userId: me.id }, { conversationId: convo.id, userId: input.attorneyId });
  db.messages.push({
    id: uid('msg'),
    conversationId: convo.id,
    senderId: DEMO_IDS.system,
    body: PRIVACY,
    createdAt: nowIso(),
    readAt: nowIso(),
    kind: 'system',
  });
  if (input.slotId) {
    const slot = db.availabilitySlots.find((s) => s.id === input.slotId && s.attorneyId === input.attorneyId);
    if (!slot || slot.status !== 'open') throw new Error('That time slot is no longer open.');
    slot.status = 'held';
    db.appointments.unshift({
      id: uid('appt'),
      inquiryId: inquiry.id,
      attorneyId: input.attorneyId,
      clientId: me.id,
      slotId: slot.id,
      status: 'requested',
      meetingMode: 'remote',
      meetingLink: null,
      createdAt: nowIso(),
    });
  }
  notify(input.attorneyId, 'lead', 'A client opened a new fictional inquiry.', `/attorney/leads/?id=${inquiry.id}`);
  log(me.id, 'inquiry', inquiry.id, 'created', 'Client opened an inquiry. No representation has started.');
  emit();
  return inquiry;
}

export function getInquiry(actor: Actor | null, id: string): Inquiry {
  const me = requireActor(actor);
  const inquiry = requireState().inquiries.find((row) => row.id === id);
  if (!inquiry) throw new NotFoundError('Inquiry not found.');
  if (me.role === 'admin') return inquiry;
  if (me.role === 'client' && inquiry.clientId === me.id) return inquiry;
  if (me.role === 'attorney' && inquiry.attorneyId === me.id) return inquiry;
  throw new AccessDeniedError('You can only read your own inquiries.');
}

export function listInquiries(actor: Actor | null): Inquiry[] {
  const me = requireActor(actor);
  const rows = requireState().inquiries;
  if (me.role === 'admin') return rows;
  if (me.role === 'client') return rows.filter((row) => row.clientId === me.id);
  if (me.role === 'attorney') return rows.filter((row) => row.attorneyId === me.id);
  throw new AccessDeniedError();
}

function convoForInquiry(inquiryId: string) {
  return requireState().conversations.find((c) => c.inquiryId === inquiryId);
}

export function getConversation(actor: Actor | null, id: string) {
  const me = requireActor(actor);
  const db = requireState();
  const convo = db.conversations.find((c) => c.id === id);
  if (!convo) throw new NotFoundError('Conversation not found.');
  const member = db.conversationMembers.some((m) => m.conversationId === id && m.userId === me.id);
  if (me.role !== 'admin' && !member) throw new AccessDeniedError('You are not part of this conversation.');
  const messages = db.messages.filter((m) => m.conversationId === id);
  return { convo, messages };
}

export function listConversations(actor: Actor | null) {
  const me = requireActor(actor);
  const db = requireState();
  return db.conversations
    .filter((c) => me.role === 'admin' || db.conversationMembers.some((m) => m.conversationId === c.id && m.userId === me.id))
    .map((c) => {
      const inquiry = db.inquiries.find((i) => i.id === c.inquiryId);
      const messages = db.messages.filter((m) => m.conversationId === c.id);
      const unread = messages.filter((m) => !m.readAt && m.senderId !== me.id).length;
      const last = messages[messages.length - 1];
      return { convo: c, inquiry, unread, last };
    });
}

export function sendMessage(actor: Actor | null, conversationId: string, body: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const member = db.conversationMembers.some((m) => m.conversationId === conversationId && m.userId === me.id);
  if (!member) throw new AccessDeniedError('You are not part of this conversation.');
  if (!body.trim()) throw new Error('Write a message first.');
  db.messages.push({
    id: uid('msg'),
    conversationId,
    senderId: me.id,
    body: body.trim(),
    createdAt: nowIso(),
    readAt: null,
    kind: 'text',
  });
  const others = db.conversationMembers.filter((m) => m.conversationId === conversationId && m.userId !== me.id);
  others.forEach((m) => notify(m.userId, 'message', 'New demo message.', me.role === 'attorney' ? '/client/messages/' : '/attorney/messages/'));
  log(me.id, 'message', conversationId, 'sent', 'Demo message sent.');
  emit();
}

export function attachDemoFile(actor: Actor | null, conversationId: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const member = db.conversationMembers.some((m) => m.conversationId === conversationId && m.userId === me.id);
  if (!member) throw new AccessDeniedError();
  db.messages.push({
    id: uid('msg'),
    conversationId,
    senderId: me.id,
    body: 'demo-notes.pdf — fictional demo fixture. No file was uploaded and nothing was scanned.',
    createdAt: nowIso(),
    readAt: null,
    kind: 'attachment',
  });
  log(me.id, 'message', conversationId, 'attachment', 'Demo attachment placeholder added.');
  emit();
}

export function markConversationRead(actor: Actor | null, conversationId: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const member = db.conversationMembers.some((m) => m.conversationId === conversationId && m.userId === me.id);
  if (!member && me.role !== 'admin') throw new AccessDeniedError();
  let changed = false;
  db.messages.forEach((m) => {
    if (m.conversationId === conversationId && m.senderId !== me.id && !m.readAt) {
      m.readAt = nowIso();
      changed = true;
    }
  });
  if (changed) emit();
}

export function searchMessages(actor: Actor | null, query: string) {
  const q = query.trim().toLowerCase();
  return listConversations(actor).filter((row) => {
    if (!q) return true;
    const db = requireState();
    const text = db.messages.filter((m) => m.conversationId === row.convo.id).map((m) => m.body).join(' ').toLowerCase();
    const names = [row.inquiry?.description ?? '', userById(row.inquiry?.attorneyId ?? '')?.name ?? '', userById(row.inquiry?.clientId ?? '')?.name ?? '']
      .join(' ')
      .toLowerCase();
    return text.includes(q) || names.includes(q);
  });
}

function ownInquiry(actor: Actor, id: string, as: 'client' | 'attorney'): Inquiry {
  const inquiry = getInquiry(actor, id);
  if (as === 'attorney' && inquiry.attorneyId !== actor.id) throw new AccessDeniedError();
  if (as === 'client' && inquiry.clientId !== actor.id) throw new AccessDeniedError();
  return inquiry;
}

function assertLicensedAttorney(actor: Actor): AttorneyProfile {
  if (actor.role !== 'attorney' && actor.role !== 'admin') throw new AccessDeniedError();
  const profile = requireState().attorneyProfiles.find((p) => p.userId === actor.id);
  if (!profile) throw new AccessDeniedError('No attorney profile.');
  if (profile.licenseStatus !== 'active') {
    throw new Error('Bar admission is required before you can accept a legal matter. Not-yet-admitted graduates can keep a draft profile only.');
  }
  return profile;
}

export function acceptForReview(actor: Actor | null, inquiryId: string): void {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  assertLicensedAttorney(me);
  if (!['inquiry', 'draft'].includes(inquiry.status)) throw new Error('This lead is not waiting for review.');
  inquiry.status = 'conflict_review';
  const db = requireState();
  db.conflictChecks.unshift({
    id: uid('cc'),
    inquiryId,
    attorneyId: me.id,
    status: 'pending',
    checkedAt: null,
    notes: 'Accepted for simulated conflict review. Representation has not started.',
  });
  notify(inquiry.clientId, 'lead', 'The attorney started a simulated conflict review.', `/client/requests/?id=${inquiryId}`);
  log(me.id, 'inquiry', inquiryId, 'conflict_review', 'Lead accepted for simulated conflict review only.');
  emit();
}

export function requestDetails(actor: Actor | null, inquiryId: string, note: string): void {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  const convo = convoForInquiry(inquiry.id);
  if (!convo) throw new NotFoundError();
  sendMessage(me, convo.id, note.trim() || 'Could you share a bit more non-confidential context? Please still avoid sensitive facts.');
}

export function declineLead(actor: Actor | null, inquiryId: string, reason: string): void {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  inquiry.status = 'cancelled';
  notify(inquiry.clientId, 'lead', 'The attorney declined this demo inquiry.', `/client/requests/?id=${inquiryId}`);
  log(me.id, 'inquiry', inquiryId, 'declined', reason || 'Attorney declined the demo lead.');
  emit();
}

export function clearConflict(actor: Actor | null, inquiryId: string): void {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  assertLicensedAttorney(me);
  const db = requireState();
  let check = db.conflictChecks.find((c) => c.inquiryId === inquiryId && c.attorneyId === me.id);
  if (!check) {
    check = { id: uid('cc'), inquiryId, attorneyId: me.id, status: 'pending', checkedAt: null, notes: '' };
    db.conflictChecks.unshift(check);
  }
  check.status = 'cleared';
  check.checkedAt = nowIso();
  check.notes = 'Simulated conflict check cleared. This is not a real conflicts system.';
  if (inquiry.status === 'inquiry' || inquiry.status === 'draft') inquiry.status = 'conflict_review';
  log(me.id, 'conflict', check.id, 'cleared', 'Simulated conflict check marked cleared.');
  emit();
}

export function flagConflict(actor: Actor | null, inquiryId: string): void {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  const db = requireState();
  let check = db.conflictChecks.find((c) => c.inquiryId === inquiryId);
  if (!check) {
    check = { id: uid('cc'), inquiryId, attorneyId: me.id, status: 'conflict_found', checkedAt: nowIso(), notes: 'Simulated conflict found.' };
    db.conflictChecks.unshift(check);
  } else {
    check.status = 'conflict_found';
    check.checkedAt = nowIso();
  }
  inquiry.status = 'cancelled';
  notify(inquiry.clientId, 'lead', 'The attorney stopped this demo inquiry after a simulated conflict.', `/client/requests/?id=${inquiryId}`);
  log(me.id, 'conflict', check.id, 'conflict_found', 'Simulated conflict found. No engagement was created.');
  emit();
}

export function sendProposal(
  actor: Actor | null,
  inquiryId: string,
  input: { scope: string; price: number; deadline: string; deliverables: string; exclusions: string; revisions: string },
): Proposal {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  assertLicensedAttorney(me);
  const db = requireState();
  const check = db.conflictChecks.find((c) => c.inquiryId === inquiryId && c.attorneyId === me.id && c.status === 'cleared');
  if (!check) throw new Error('Clear the simulated conflict check before sending terms.');
  if (!input.scope.trim() || !(input.price >= 0) || !input.deadline) throw new Error('Scope, price, and deadline are required.');
  const proposal: Proposal = {
    id: uid('prop'),
    inquiryId,
    attorneyId: me.id,
    scope: input.scope.trim(),
    deliverables: input.deliverables.trim() || 'Described in the scope. Fictional demo.',
    exclusions: input.exclusions.trim() || 'No court appearance and no outcome guarantee.',
    priceType: 'fixed',
    price: input.price,
    deadline: input.deadline,
    revisions: input.revisions.trim() || 'One round of corrections',
    jurisdiction: inquiry.jurisdiction,
    expiresAt: input.deadline,
    status: 'sent',
    createdAt: nowIso(),
  };
  db.proposals.unshift(proposal);
  db.engagements.unshift({
    id: uid('eng'),
    proposalId: proposal.id,
    clientAcceptedAt: null,
    attorneyAcceptedAt: nowIso(),
    status: 'pending',
  });
  inquiry.status = 'proposal_sent';
  notify(inquiry.clientId, 'proposal', 'A fictional engagement proposal is ready to review.', `/client/requests/?id=${inquiryId}`);
  log(me.id, 'proposal', proposal.id, 'sent', 'Attorney sent engagement terms. The matter is not active yet.');
  emit();
  return proposal;
}

export function acceptProposal(actor: Actor | null, proposalId: string, paymentConfirmed: boolean): Matter {
  const me = requireActor(actor);
  if (!paymentConfirmed) throw new Error('Confirm the simulated payment notice. No money is charged.');
  const db = requireState();
  const proposal = db.proposals.find((p) => p.id === proposalId);
  if (!proposal || proposal.status !== 'sent') throw new Error('That proposal is not open.');
  const inquiry = getInquiry(me, proposal.inquiryId);
  if (inquiry.clientId !== me.id) throw new AccessDeniedError('Only the client on this inquiry can accept.');
  const engagement = db.engagements.find((e) => e.proposalId === proposal.id);
  if (!engagement) throw new NotFoundError();
  proposal.status = 'accepted';
  engagement.clientAcceptedAt = nowIso();
  engagement.status = 'active';
  inquiry.status = 'active';
  const matter: Matter = {
    id: uid('matter'),
    engagementId: engagement.id,
    inquiryId: inquiry.id,
    clientId: inquiry.clientId,
    attorneyId: inquiry.attorneyId,
    status: 'active',
    startedAt: nowIso(),
    completedAt: null,
  };
  db.matters.unshift(matter);
  db.matterMilestones.push({
    id: uid('ms'),
    matterId: matter.id,
    title: 'Kickoff (demo)',
    dueAt: proposal.deadline,
    status: 'pending',
  });
  db.demoPayments.unshift({
    id: uid('pay'),
    matterId: matter.id,
    amount: proposal.price,
    status: 'paid',
    simulated: true,
    createdAt: nowIso(),
  });
  const convo = convoForInquiry(inquiry.id);
  if (convo) convo.matterId = matter.id;
  notify(inquiry.attorneyId, 'matter', 'The client accepted the demo engagement. Simulated payment recorded. No money moved.', `/attorney/matters/?id=${matter.id}`);
  log(me.id, 'matter', matter.id, 'started', 'Demo payment — no money charged. Matter is now active.');
  emit();
  return matter;
}

export function declineProposal(actor: Actor | null, proposalId: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const proposal = db.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new NotFoundError();
  const inquiry = getInquiry(me, proposal.inquiryId);
  if (inquiry.clientId !== me.id) throw new AccessDeniedError();
  proposal.status = 'declined';
  inquiry.status = 'cancelled';
  log(me.id, 'proposal', proposal.id, 'declined', 'Client declined the demo proposal.');
  emit();
}

export function listMatters(actor: Actor | null): Matter[] {
  const me = requireActor(actor);
  const rows = requireState().matters;
  if (me.role === 'admin') return rows;
  if (me.role === 'client') return rows.filter((m) => m.clientId === me.id);
  if (me.role === 'attorney') return rows.filter((m) => m.attorneyId === me.id);
  throw new AccessDeniedError();
}

export function getMatter(actor: Actor | null, id: string): Matter {
  const me = requireActor(actor);
  const matter = requireState().matters.find((m) => m.id === id);
  if (!matter) throw new NotFoundError();
  if (me.role === 'admin') return matter;
  if (me.role === 'client' && matter.clientId === me.id) return matter;
  if (me.role === 'attorney' && matter.attorneyId === me.id) return matter;
  throw new AccessDeniedError('You can only read your own matters.');
}

export function setMilestone(actor: Actor | null, milestoneId: string, status: 'pending' | 'done'): void {
  const me = requireActor(actor);
  const db = requireState();
  const milestone = db.matterMilestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new NotFoundError();
  const matter = getMatter(me, milestone.matterId);
  if (matter.attorneyId !== me.id && me.role !== 'admin') throw new AccessDeniedError();
  milestone.status = status;
  log(me.id, 'milestone', milestone.id, status, `Milestone marked ${status}.`);
  emit();
}

export function addMilestone(actor: Actor | null, matterId: string, title: string): void {
  const me = requireActor(actor);
  const matter = getMatter(me, matterId);
  if (matter.attorneyId !== me.id) throw new AccessDeniedError();
  if (!title.trim()) throw new Error('Name the milestone.');
  requireState().matterMilestones.push({
    id: uid('ms'),
    matterId,
    title: title.trim(),
    dueAt: '2026-12-15',
    status: 'pending',
  });
  log(me.id, 'matter', matterId, 'milestone_added', 'Attorney added a demo milestone.');
  emit();
}

export function completeMatter(actor: Actor | null, matterId: string): void {
  const me = requireActor(actor);
  const matter = getMatter(me, matterId);
  if (matter.attorneyId !== me.id) throw new AccessDeniedError();
  if (matter.status !== 'active') throw new Error('Only an active matter can be completed.');
  matter.status = 'completed';
  matter.completedAt = nowIso();
  const inquiry = requireState().inquiries.find((i) => i.id === matter.inquiryId);
  if (inquiry) inquiry.status = 'completed';
  const engagement = requireState().engagements.find((e) => e.id === matter.engagementId);
  if (engagement) engagement.status = 'ended';
  notify(matter.clientId, 'matter', 'The demo matter is complete. You can leave a fictional review.', `/client/matters/?id=${matter.id}`);
  log(me.id, 'matter', matter.id, 'completed', 'Attorney marked the demo matter completed.');
  emit();
}

export function submitReview(actor: Actor | null, matterId: string, rating: number, text: string): void {
  const me = requireActor(actor);
  const matter = getMatter(me, matterId);
  if (matter.clientId !== me.id) throw new AccessDeniedError('Only the client can review this matter.');
  if (matter.status !== 'completed') throw new Error('Reviews open only after a completed demo matter.');
  if (requireState().reviews.some((r) => r.matterId === matterId)) throw new Error('This matter already has a review.');
  if (!text.trim() || rating < 1 || rating > 5) throw new Error('Add a rating from 1 to 5 and a short note.');
  requireState().reviews.unshift({
    id: uid('rev'),
    matterId,
    clientId: me.id,
    attorneyId: matter.attorneyId,
    rating,
    text: text.trim(),
    isDemo: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    moderation: 'visible',
  });
  log(me.id, 'review', matterId, 'submitted', 'Client submitted a fictional demo review.');
  emit();
}

export function editReview(actor: Actor | null, reviewId: string, rating: number, text: string): void {
  const me = requireActor(actor);
  const review = requireState().reviews.find((r) => r.id === reviewId);
  if (!review) throw new NotFoundError();
  if (review.clientId !== me.id) throw new AccessDeniedError();
  const age = Date.now() - new Date(review.createdAt).getTime();
  if (age > REVIEW_EDIT_HOURS * 3600 * 1000) throw new Error('The demo edit window for this review has closed.');
  review.rating = rating;
  review.text = text.trim();
  review.updatedAt = nowIso();
  log(me.id, 'review', review.id, 'edited', 'Client edited a fictional demo review.');
  emit();
}

export function reportReview(actor: Actor | null, reviewId: string, details: string): void {
  const me = requireActor(actor);
  const review = requireState().reviews.find((r) => r.id === reviewId);
  if (!review) throw new NotFoundError();
  review.moderation = 'reported';
  requireState().reports.unshift({
    id: uid('rpt'),
    email: userById(me.id)?.email ?? '',
    targetType: 'review',
    targetId: reviewId,
    details: details || 'Reported from the profile.',
    status: 'open',
    createdAt: nowIso(),
  });
  log(me.id, 'review', reviewId, 'reported', 'Review flagged for demo moderation.');
  emit();
}

export function proposeSlot(actor: Actor | null, inquiryId: string, slotId: string): Appointment {
  const me = requireActor(actor);
  const inquiry = ownInquiry(me, inquiryId, 'attorney');
  assertLicensedAttorney(me);
  const db = requireState();
  const slot = db.availabilitySlots.find((s) => s.id === slotId && s.attorneyId === me.id);
  if (!slot || slot.status !== 'open') throw new Error('That slot is not open. Double booking is blocked.');
  slot.status = 'held';
  const appt: Appointment = {
    id: uid('appt'),
    inquiryId,
    attorneyId: me.id,
    clientId: inquiry.clientId,
    slotId,
    status: 'proposed',
    meetingMode: 'remote',
    meetingLink: null,
    createdAt: nowIso(),
  };
  db.appointments.unshift(appt);
  notify(inquiry.clientId, 'appointment', 'The attorney proposed a demo consult time.', '/client/appointments/');
  log(me.id, 'appointment', appt.id, 'proposed', 'Attorney proposed a slot.');
  emit();
  return appt;
}

export function confirmAppointment(actor: Actor | null, appointmentId: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new NotFoundError();
  if (appt.clientId !== me.id && me.role !== 'admin') throw new AccessDeniedError('Only the client can confirm this offer.');
  if (!['proposed', 'requested', 'rescheduled'].includes(appt.status)) throw new Error('This appointment cannot be confirmed.');
  const slot = db.availabilitySlots.find((s) => s.id === appt.slotId);
  if (!slot || (slot.status !== 'held' && slot.status !== 'open')) throw new Error('That slot is no longer available.');
  if (db.appointments.some((a) => a.slotId === slot.id && a.status === 'confirmed' && a.id !== appt.id)) {
    throw new Error('That slot is already booked.');
  }
  slot.status = 'booked';
  appt.status = 'confirmed';
  appt.meetingLink = `https://demo.legalgrads.test/meet/${appt.id}`;
  notify(appt.attorneyId, 'appointment', 'The client confirmed the demo consult.', '/attorney/calendar/');
  notify(appt.clientId, 'appointment', 'Demo consult confirmed. The video link is simulated.', '/client/appointments/');
  log(me.id, 'appointment', appt.id, 'confirmed', 'Consult confirmed on both calendars. Video link is simulated.');
  emit();
}

export function requestReschedule(actor: Actor | null, appointmentId: string, note: string): void {
  const me = requireActor(actor);
  const db = requireState();
  const appt = db.appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new NotFoundError();
  if (appt.clientId !== me.id && appt.attorneyId !== me.id) throw new AccessDeniedError();
  appt.status = 'rescheduled';
  const slot = db.availabilitySlots.find((s) => s.id === appt.slotId);
  if (slot && slot.status !== 'blocked') slot.status = 'open';
  const other = me.id === appt.clientId ? appt.attorneyId : appt.clientId;
  notify(other, 'appointment', note || 'A reschedule was requested.', me.role === 'client' ? '/attorney/calendar/' : '/client/appointments/');
  log(me.id, 'appointment', appt.id, 'rescheduled', note || 'Reschedule requested.');
  emit();
}

export function cancelAppointment(actor: Actor | null, appointmentId: string): void {
  const me = requireActor(actor);
  const appt = requireState().appointments.find((a) => a.id === appointmentId);
  if (!appt) throw new NotFoundError();
  if (appt.clientId !== me.id && appt.attorneyId !== me.id && me.role !== 'admin') throw new AccessDeniedError();
  appt.status = 'cancelled';
  const slot = requireState().availabilitySlots.find((s) => s.id === appt.slotId);
  if (slot) slot.status = 'open';
  log(me.id, 'appointment', appt.id, 'cancelled', 'Demo appointment cancelled and the slot was released.');
  emit();
}

export function listAppointments(actor: Actor | null): Appointment[] {
  const me = requireActor(actor);
  const rows = requireState().appointments;
  if (me.role === 'admin') return rows;
  if (me.role === 'client') return rows.filter((a) => a.clientId === me.id);
  if (me.role === 'attorney') return rows.filter((a) => a.attorneyId === me.id);
  throw new AccessDeniedError();
}

export function addSlot(actor: Actor | null, startAtUtc: string): void {
  const me = requireActor(actor);
  const profile = assertLicensedAttorney(me);
  if (!startAtUtc) throw new Error('Choose a start time.');
  const start = new Date(startAtUtc);
  if (Number.isNaN(start.getTime())) throw new Error('That time is not valid.');
  const overlap = requireState().availabilitySlots.some((s) => s.attorneyId === profile.userId && s.startAtUtc === start.toISOString() && s.status !== 'blocked');
  if (overlap) throw new Error('You already have a slot at that time.');
  requireState().availabilitySlots.push({
    id: uid('slot'),
    attorneyId: profile.userId,
    startAtUtc: start.toISOString(),
    endAtUtc: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
    status: 'open',
  });
  log(me.id, 'slot', profile.userId, 'added', 'Attorney published a demo availability slot.');
  emit();
}

export function blockSlot(actor: Actor | null, slotId: string): void {
  const me = requireActor(actor);
  const slot = requireState().availabilitySlots.find((s) => s.id === slotId);
  if (!slot || slot.attorneyId !== me.id) throw new AccessDeniedError();
  if (slot.status === 'booked') throw new Error('Cancel the confirmed consult before blocking this time.');
  slot.status = 'blocked';
  log(me.id, 'slot', slot.id, 'blocked', 'Attorney blocked a demo slot.');
  emit();
}

export function toggleFavorite(actor: Actor | null, attorneyId: string): boolean {
  const me = requireActor(actor);
  if (me.role !== 'client') throw new AccessDeniedError('Switch to the client role to save attorneys.');
  const db = requireState();
  const existing = db.favorites.find((f) => f.clientId === me.id && f.attorneyId === attorneyId);
  if (existing) {
    db.favorites = db.favorites.filter((f) => f !== existing);
    log(me.id, 'favorite', attorneyId, 'removed', 'Removed a saved attorney.');
    emit();
    return false;
  }
  db.favorites.unshift({ id: `${me.id}_${attorneyId}`, clientId: me.id, attorneyId, createdAt: nowIso() });
  log(me.id, 'favorite', attorneyId, 'saved', 'Saved an attorney.');
  emit();
  return true;
}

export function listFavorites(actor: Actor | null): AttorneyCard[] {
  const me = requireActor(actor);
  if (me.role !== 'client') throw new AccessDeniedError();
  return requireState()
    .favorites.filter((f) => f.clientId === me.id)
    .map((f) => toCard(requireState(), f.attorneyId))
    .filter((c): c is AttorneyCard => !!c);
}

export function isFavorite(clientId: string, attorneyId: string): boolean {
  return requireState().favorites.some((f) => f.clientId === clientId && f.attorneyId === attorneyId);
}

export function updateHourlyRate(actor: Actor | null, rate: number): void {
  const me = requireActor(actor);
  const profile = requireState().attorneyProfiles.find((p) => p.userId === me.id);
  if (!profile) throw new AccessDeniedError();
  if (!(rate >= 0) || Number.isNaN(rate)) throw new Error('Hourly rate must be 0 or greater.');
  profile.hourlyRate = Math.round(rate);
  log(me.id, 'profile', me.id, 'rate', `Demo hourly rate set to ${profile.hourlyRate}.`);
  emit();
}

export function addService(actor: Actor | null, input: { title: string; fixedPrice: number; scope: string; turnaroundDays: number }): Service {
  const me = requireActor(actor);
  if (me.role !== 'attorney') throw new AccessDeniedError();
  if (!input.title.trim() || !(input.fixedPrice >= 0) || !input.scope.trim()) {
    throw new Error('Title, scope, and a price of 0 or more are required.');
  }
  const service: Service = {
    id: uid('svc'),
    attorneyId: me.id,
    title: input.title.trim(),
    scope: input.scope.trim(),
    deliverables: 'Described in the scope. Fictional demo service.',
    exclusions: 'No guarantee of outcome. Demo only.',
    fixedPrice: Math.round(input.fixedPrice),
    turnaroundDays: input.turnaroundDays || 5,
    active: true,
    consultationIncluded: true,
  };
  requireState().services.unshift(service);
  log(me.id, 'service', service.id, 'added', `Added demo service ${service.title}.`);
  emit();
  return service;
}

export function toggleService(actor: Actor | null, serviceId: string, active: boolean): void {
  const me = requireActor(actor);
  const service = requireState().services.find((s) => s.id === serviceId);
  if (!service || service.attorneyId !== me.id) throw new AccessDeniedError();
  service.active = active;
  emit();
}

export function updateProfile(actor: Actor | null, patch: Partial<AttorneyProfile> & { specialtyIds?: string[] }): void {
  const me = requireActor(actor);
  const db = requireState();
  const profile = db.attorneyProfiles.find((p) => p.userId === me.id);
  if (!profile) throw new AccessDeniedError();
  if (typeof patch.hourlyRate === 'number' && (!(patch.hourlyRate >= 0) || Number.isNaN(patch.hourlyRate))) {
    throw new Error('Hourly rate must be 0 or greater.');
  }
  const allowed: (keyof AttorneyProfile)[] = ['displayName', 'bio', 'lawSchool', 'graduationYear', 'admissionDate', 'licenseStatus', 'hourlyRate', 'city', 'remoteAllowed', 'inPersonAllowed', 'languages', 'cardTags'];
  allowed.forEach((key) => {
    if (key in patch && patch[key] !== undefined) {
      (profile as unknown as Record<string, unknown>)[key] = patch[key] as unknown;
    }
  });
  if (patch.licenseJurisdictions) profile.licenseJurisdictions = patch.licenseJurisdictions;
  if (patch.specialtyIds) {
    db.attorneySpecialties = db.attorneySpecialties.filter((row) => row.attorneyId !== me.id);
    patch.specialtyIds.forEach((specialtyId) => db.attorneySpecialties.push({ attorneyId: me.id, specialtyId }));
    profile.cardTags = patch.specialtyIds
      .map((id) => db.specialties.find((s) => s.id === id)?.name)
      .filter((name): name is string => !!name);
  }
  if (profile.licenseStatus !== 'active') profile.isPublished = false;
  log(me.id, 'profile', me.id, 'updated', 'Attorney profile updated. Search uses the saved fields.');
  emit();
}

export function publishProfile(actor: Actor | null): void {
  const me = requireActor(actor);
  const db = requireState();
  const profile = db.attorneyProfiles.find((p) => p.userId === me.id);
  if (!profile) throw new AccessDeniedError();
  if (profile.licenseStatus !== 'active' || !profile.admissionDate) {
    throw new Error('You cannot publish or accept independent legal matters until you are admitted. Draft profiles stay private.');
  }
  if (profile.verificationStatus !== 'approved') {
    throw new Error('Simulated verification is still pending. A demo admin must approve it before publishing.');
  }
  if (!withinWindow(profile.admissionDate, db.settings.eligibilityWindowYears)) {
    throw new Error(`Admission is outside the ${db.settings.eligibilityWindowYears}-year newly licensed window.`);
  }
  if (!profile.bio.trim() || !profile.lawSchool.trim()) throw new Error('Add a school and a bio before publishing.');
  profile.isPublished = true;
  log(me.id, 'profile', me.id, 'published', 'Profile published into demo search.');
  emit();
}

export function saveOnboarding(
  actor: Actor | null,
  input: {
    displayName: string;
    licenseStatus: AttorneyProfile['licenseStatus'];
    admissionDate: string | null;
    jurisdiction: string;
    lawSchool: string;
    graduationYear: number;
    specialtyIds: string[];
    bio: string;
    hourlyRate: number;
    city: string;
  },
): void {
  updateProfile(actor, {
    displayName: input.displayName,
    licenseStatus: input.licenseStatus,
    admissionDate: input.licenseStatus === 'active' ? input.admissionDate : null,
    licenseJurisdictions: input.jurisdiction ? [input.jurisdiction] : [],
    lawSchool: input.lawSchool,
    graduationYear: input.graduationYear,
    specialtyIds: input.specialtyIds,
    bio: input.bio,
    hourlyRate: input.hourlyRate,
    city: input.city,
  });
}

export function updateClient(actor: Actor | null, patch: { location?: string; state?: string; preferences?: string; name?: string }): void {
  const me = requireActor(actor);
  const db = requireState();
  const profile = db.clientProfiles.find((p) => p.userId === me.id);
  const user = userById(me.id);
  if (!profile || !user) throw new AccessDeniedError();
  if (patch.location !== undefined) profile.location = patch.location;
  if (patch.state !== undefined) profile.state = patch.state;
  if (patch.preferences !== undefined) profile.preferences = patch.preferences;
  if (patch.name) user.name = patch.name;
  emit();
}

export function joinWaitlist(email: string, role: string, note = ''): void {
  const db = requireState();
  db.waitlistEntries.unshift({ id: uid('wait'), email: email.trim(), role, note, createdAt: nowIso() });
  log(DEMO_IDS.system, 'waitlist', email, 'joined', 'Waitlist signup stored in this browser only. No email was sent.');
  emit();
}

export function listNotifications(actor: Actor | null) {
  const me = requireActor(actor);
  return requireState().notifications.filter((n) => n.userId === me.id);
}

export function markAllRead(actor: Actor | null): void {
  const me = requireActor(actor);
  requireState().notifications.forEach((n) => {
    if (n.userId === me.id && !n.readAt) n.readAt = nowIso();
  });
  emit();
}

export function createPrivacyRequest(input: { email: string; name: string; type: 'access' | 'correction' | 'deletion' | 'opt_out_sale'; details: string }) {
  if (!input.email.trim() || !input.details.trim()) throw new Error('Email and a short description are required.');
  const row = {
    id: uid('prv'),
    email: input.email.trim(),
    name: input.name.trim() || 'Demo requester',
    type: input.type,
    details: input.details.trim(),
    status: 'open' as const,
    resolution: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  requireState().privacyRequests.unshift(row);
  log(DEMO_IDS.system, 'privacy_request', row.id, 'opened', `Privacy request ${row.type} opened.`);
  emit();
  return row;
}

export function listPrivacyRequests(actor: Actor | null) {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError('Only the demo admin can read the privacy log.');
  return requireState().privacyRequests;
}

export function resolvePrivacyRequest(actor: Actor | null, id: string, status: 'completed' | 'rejected', resolution: string): void {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  const row = requireState().privacyRequests.find((r) => r.id === id);
  if (!row) throw new NotFoundError();
  if (status === 'rejected' && !resolution.trim()) throw new Error('Add a reason to reject the request.');
  row.status = status;
  row.resolution = resolution.trim() || 'Completed in the demo dataset.';
  row.updatedAt = nowIso();
  log(me.id, 'privacy_request', id, status, `Privacy request ${status}: ${row.resolution}`);
  emit();
}

export function lookupPrivacyRequest(id: string) {
  return requireState().privacyRequests.find((r) => r.id === id) ?? null;
}

export function createReport(input: { email: string; targetType: string; targetId: string; details: string }) {
  if (!input.details.trim()) throw new Error('Describe the issue.');
  const row = {
    id: uid('rpt'),
    email: input.email.trim(),
    targetType: input.targetType,
    targetId: input.targetId.trim(),
    details: input.details.trim(),
    status: 'open' as const,
    createdAt: nowIso(),
  };
  requireState().reports.unshift(row);
  log(DEMO_IDS.system, 'report', row.id, 'opened', `Report opened (${row.targetType}).`);
  emit();
  return row;
}

export function listReports(actor: Actor | null) {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  return requireState().reports;
}

export function setReportStatus(actor: Actor | null, id: string, status: 'acknowledged' | 'closed'): void {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  const row = requireState().reports.find((r) => r.id === id);
  if (!row) throw new NotFoundError();
  row.status = status;
  log(me.id, 'report', id, status, `Report ${status}.`);
  emit();
}

export function setVerification(actor: Actor | null, attorneyId: string, status: 'approved' | 'rejected' | 'pending'): void {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError('Only the demo admin can change simulated verification.');
  const profile = requireState().attorneyProfiles.find((p) => p.userId === attorneyId);
  if (!profile) throw new NotFoundError();
  profile.verificationStatus = status;
  profile.verificationDate = status === 'approved' ? nowIso().slice(0, 10) : null;
  if (status !== 'approved') profile.isPublished = false;
  log(me.id, 'verification', attorneyId, status, `Simulated verification set to ${status}.`);
  emit();
}

export function setEligibilityWindow(actor: Actor | null, years: number): void {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  if (!(years >= 1 && years <= 10)) throw new Error('Use a window between 1 and 10 years.');
  requireState().settings.eligibilityWindowYears = years;
  log(me.id, 'settings', 'window', 'updated', `Newly licensed window set to ${years} years.`);
  emit();
}

export function bumpTerms(actor: Actor | null): void {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  const db = requireState();
  const stamp = nowIso().slice(0, 10);
  db.settings.termsVersion = `${stamp}-draft-r${db.activityEvents.length}`;
  db.settings.termsUpdatedAt = nowIso();
  log(me.id, 'terms', db.settings.termsVersion, 'bumped', 'Draft terms version changed. Users must re-consent.');
  emit();
}

export function listActivity(actor: Actor | null) {
  const me = requireActor(actor);
  if (me.role !== 'admin') throw new AccessDeniedError();
  return requireState().activityEvents;
}

export function exportData(actor: Actor | null): string {
  const me = requireActor(actor);
  const db = requireState();
  const mine = {
    note: 'Export of this browser’s fictional demo data for your account only.',
    user: db.users.find((u) => u.id === me.id),
    clientProfile: db.clientProfiles.find((p) => p.userId === me.id) ?? null,
    attorneyProfile: db.attorneyProfiles.find((p) => p.userId === me.id) ?? null,
    inquiries: db.inquiries.filter((i) => i.clientId === me.id || i.attorneyId === me.id),
    matters: db.matters.filter((m) => m.clientId === me.id || m.attorneyId === me.id),
    messages: db.messages.filter((m) => {
      const convo = db.conversations.find((c) => c.id === m.conversationId);
      if (!convo) return false;
      return db.conversationMembers.some((mem) => mem.conversationId === convo.id && mem.userId === me.id);
    }),
    reviews: db.reviews.filter((r) => r.clientId === me.id || r.attorneyId === me.id),
    terms: db.termsAcceptances.filter((t) => t.userId === me.id),
  };
  return JSON.stringify(mine, null, 2);
}

export function deleteAccount(actor: Actor | null): { removed: string[]; retained: string[] } {
  const me = requireActor(actor);
  const db = requireState();
  const user = db.users.find((u) => u.id === me.id);
  if (!user || user.role === 'admin' || user.role === 'system') throw new Error('This demo account cannot be deleted.');
  user.name = 'Deleted demo user';
  user.email = `deleted+${user.id}@demo.legalgrads.test`;
  user.passwordHash = '';
  user.deletedAt = nowIso();
  db.messages.forEach((m) => {
    if (m.senderId === me.id && m.kind !== 'system') m.body = '[deleted in demo]';
  });
  const profile = db.attorneyProfiles.find((p) => p.userId === me.id);
  if (profile) {
    profile.isPublished = false;
    profile.bio = '';
    profile.displayName = 'Deleted demo profile';
  }
  const client = db.clientProfiles.find((p) => p.userId === me.id);
  if (client) {
    client.location = '';
    client.preferences = '';
  }
  log(DEMO_IDS.system, 'user', me.id, 'deleted', 'Account anonymized in the demo. An audit event is retained without the old email.');
  emit();
  return {
    removed: ['Name', 'Email', 'Password', 'Profile bio', 'Message text you sent'],
    retained: ['Audit log entry without your old email', 'Matter status history', 'Simulated payment amounts with no card data'],
  };
}

export function changePassword(actor: Actor | null, current: string, next: string): void {
  const me = requireActor(actor);
  const user = userById(me.id);
  if (!user) throw new NotFoundError();
  if (user.passwordHash !== demoHash(current)) throw new Error('Current demo password does not match.');
  if (next.length < 8) throw new Error('Use at least 8 characters.');
  user.passwordHash = demoHash(next);
  emit();
}

export function dashboardCounts(actor: Actor | null) {
  const me = requireActor(actor);
  const db = requireState();
  if (me.role === 'client') {
    const inquiries = db.inquiries.filter((i) => i.clientId === me.id);
    return {
      inquiries: inquiries.filter((i) => !['completed', 'cancelled'].includes(i.status)).length,
      appointments: db.appointments.filter((a) => a.clientId === me.id && ['proposed', 'confirmed', 'requested', 'rescheduled'].includes(a.status)).length,
      matters: db.matters.filter((m) => m.clientId === me.id && m.status === 'active').length,
      unread: db.messages.filter((m) => !m.readAt && m.senderId !== me.id && db.conversationMembers.some((c) => c.conversationId === m.conversationId && c.userId === me.id)).length,
      saved: db.favorites.filter((f) => f.clientId === me.id).length,
    };
  }
  const leads = db.inquiries.filter((i) => i.attorneyId === me.id);
  const earnings = db.demoPayments
    .filter((p) => db.matters.some((m) => m.id === p.matterId && m.attorneyId === me.id && p.status === 'paid'))
    .reduce((sum, p) => sum + p.amount, 0);
  return {
    leads: leads.filter((i) => i.status === 'inquiry').length,
    conflicts: leads.filter((i) => i.status === 'conflict_review').length,
    appointments: db.appointments.filter((a) => a.attorneyId === me.id && a.status === 'confirmed').length,
    matters: db.matters.filter((m) => m.attorneyId === me.id && m.status === 'active').length,
    unread: db.messages.filter((m) => !m.readAt && m.senderId !== me.id && db.conversationMembers.some((c) => c.conversationId === m.conversationId && c.userId === me.id)).length,
    earnings,
  };
}
