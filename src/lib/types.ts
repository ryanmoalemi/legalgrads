export type Role = 'client' | 'attorney' | 'admin' | 'system';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  emailVerified: boolean;
  adultConfirmed: boolean;
  deletedAt: string | null;
}

export interface ClientProfile {
  userId: string;
  location: string;
  state: string;
  preferences: string;
}

export type LicenseStatus = 'active' | 'pending' | 'not_admitted';
export type VerificationStatus = 'approved' | 'pending' | 'rejected';

export interface AttorneyProfile {
  userId: string;
  slug: string;
  displayName: string;
  firstName: string;
  bio: string;
  lawSchool: string;
  graduationYear: number;
  admissionDate: string | null;
  licenseJurisdictions: string[];
  licenseStatus: LicenseStatus;
  verificationStatus: VerificationStatus;
  verificationDate: string | null;
  hourlyRate: number;
  photoUrl: string;
  languages: string[];
  remoteAllowed: boolean;
  inPersonAllowed: boolean;
  isPublished: boolean;
  city: string;
  timezone: string;
  responseTimeHours: number;
  cardTags: string[];
}

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  examples: string;
}

export interface AttorneySpecialty {
  attorneyId: string;
  specialtyId: string;
}

export interface Service {
  id: string;
  attorneyId: string;
  title: string;
  scope: string;
  deliverables: string;
  exclusions: string;
  fixedPrice: number;
  turnaroundDays: number;
  active: boolean;
  consultationIncluded: boolean;
}

export type SlotStatus = 'open' | 'held' | 'booked' | 'blocked';

export interface AvailabilitySlot {
  id: string;
  attorneyId: string;
  startAtUtc: string;
  endAtUtc: string;
  status: SlotStatus;
}

export interface Favorite {
  id: string;
  clientId: string;
  attorneyId: string;
  createdAt: string;
}

export type InquiryStatus =
  | 'draft'
  | 'inquiry'
  | 'conflict_review'
  | 'proposal_sent'
  | 'engagement_accepted'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Inquiry {
  id: string;
  clientId: string;
  attorneyId: string;
  specialtyId: string;
  serviceId: string | null;
  kind: 'consultation' | 'quote' | 'fixed_price' | 'message';
  description: string;
  budget: string;
  urgency: string;
  jurisdiction: string;
  contactPreference: string;
  durationMinutes: number;
  status: InquiryStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  inquiryId: string;
  matterId: string | null;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  kind: 'text' | 'system' | 'attachment';
}

export type AppointmentStatus =
  | 'requested'
  | 'proposed'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: string;
  inquiryId: string;
  attorneyId: string;
  clientId: string;
  slotId: string;
  status: AppointmentStatus;
  meetingMode: 'remote' | 'in_person';
  meetingLink: string | null;
  createdAt: string;
}

export interface ConflictCheck {
  id: string;
  inquiryId: string;
  attorneyId: string;
  status: 'pending' | 'cleared' | 'conflict_found';
  checkedAt: string | null;
  notes: string;
}

export interface Proposal {
  id: string;
  inquiryId: string;
  attorneyId: string;
  scope: string;
  deliverables: string;
  exclusions: string;
  priceType: 'fixed' | 'hourly';
  price: number;
  deadline: string;
  revisions: string;
  jurisdiction: string;
  expiresAt: string;
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

export interface Engagement {
  id: string;
  proposalId: string;
  clientAcceptedAt: string | null;
  attorneyAcceptedAt: string | null;
  status: 'pending' | 'active' | 'ended';
}

export interface Matter {
  id: string;
  engagementId: string;
  inquiryId: string;
  clientId: string;
  attorneyId: string;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  startedAt: string;
  completedAt: string | null;
}

export interface MatterMilestone {
  id: string;
  matterId: string;
  title: string;
  dueAt: string;
  status: 'pending' | 'done';
}

export interface DemoPayment {
  id: string;
  matterId: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  simulated: true;
  createdAt: string;
}

export interface Review {
  id: string;
  matterId: string;
  clientId: string;
  attorneyId: string;
  rating: number;
  text: string;
  isDemo: true;
  createdAt: string;
  updatedAt: string;
  moderation: 'visible' | 'reported' | 'hidden';
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  href: string;
}

export interface ActivityEvent {
  id: string;
  actorId: string;
  objectType: string;
  objectId: string;
  action: string;
  summary: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  role: string;
  note: string;
  createdAt: string;
}

export interface PrivacyRequest {
  id: string;
  email: string;
  name: string;
  type: 'access' | 'correction' | 'deletion' | 'opt_out_sale';
  details: string;
  status: 'open' | 'completed' | 'rejected';
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  email: string;
  targetType: string;
  targetId: string;
  details: string;
  status: 'open' | 'acknowledged' | 'closed';
  createdAt: string;
}

export interface TermsAcceptance {
  id: string;
  userId: string;
  version: string;
  acceptedAt: string;
}

export interface PasswordReset {
  id: string;
  email: string;
  token: string;
  createdAt: string;
  usedAt: string | null;
}

export interface Settings {
  termsVersion: string;
  termsUpdatedAt: string;
  eligibilityWindowYears: number;
}

export interface DBState {
  seedVersion: number;
  settings: Settings;
  users: User[];
  clientProfiles: ClientProfile[];
  attorneyProfiles: AttorneyProfile[];
  specialties: Specialty[];
  attorneySpecialties: AttorneySpecialty[];
  services: Service[];
  availabilitySlots: AvailabilitySlot[];
  favorites: Favorite[];
  inquiries: Inquiry[];
  conversations: Conversation[];
  conversationMembers: ConversationMember[];
  messages: Message[];
  appointments: Appointment[];
  conflictChecks: ConflictCheck[];
  proposals: Proposal[];
  engagements: Engagement[];
  matters: Matter[];
  matterMilestones: MatterMilestone[];
  demoPayments: DemoPayment[];
  reviews: Review[];
  notifications: Notification[];
  activityEvents: ActivityEvent[];
  waitlistEntries: WaitlistEntry[];
  privacyRequests: PrivacyRequest[];
  reports: Report[];
  termsAcceptances: TermsAcceptance[];
  passwordResets: PasswordReset[];
}

export interface Actor {
  id: string;
  role: Role;
}

export interface SearchFilters {
  q?: string;
  specialties?: string[];
  jurisdiction?: string;
  rateMin?: number;
  rateMax?: number;
  recentYears?: number;
  fixedPrice?: boolean;
  consultation?: boolean;
  format?: '' | 'remote' | 'in_person';
  sort?: 'relevance' | 'price' | 'newest' | 'response';
}

export interface AttorneyCard {
  userId: string;
  slug: string;
  displayName: string;
  firstName: string;
  photoUrl: string;
  city: string;
  licenseJurisdictions: string[];
  lawSchool: string;
  graduationYear: number;
  admissionDate: string | null;
  hourlyRate: number;
  bio: string;
  cardTags: string[];
  specialtySlugs: string[];
  specialtyNames: string[];
  minFixedPrice: number | null;
  responseTimeHours: number;
  remoteAllowed: boolean;
  inPersonAllowed: boolean;
  languages: string[];
  verificationStatus: VerificationStatus;
  verificationDate: string | null;
  licenseStatus: LicenseStatus;
  bookable: boolean;
  unavailableReason: string | null;
  timezone: string;
  fictional: true;
}
