import { DEMO_IDS, DEMO_PASSWORD, SEED_VERSION, SPECIALTIES, TERMS_UPDATED_AT, TERMS_VERSION } from './catalog';
import { demoHash } from './format';
import type {
  ActivityEvent,
  Appointment,
  AttorneyProfile,
  AttorneySpecialty,
  AvailabilitySlot,
  ConflictCheck,
  Conversation,
  ConversationMember,
  DBState,
  DemoPayment,
  Engagement,
  Inquiry,
  Matter,
  MatterMilestone,
  Message,
  Notification,
  Proposal,
  Review,
  Service,
  TermsAcceptance,
  User,
} from './types';

const HASH = demoHash(DEMO_PASSWORD);
const T0 = '2026-09-01T15:00:00.000Z';
const T1 = '2026-09-15T15:00:00.000Z';
const T2 = '2026-10-01T15:00:00.000Z';
const T3 = '2026-10-10T15:00:00.000Z';

function user(
  id: string,
  role: User['role'],
  name: string,
  email: string,
  createdAt = T0,
): User {
  return {
    id,
    role,
    name,
    email,
    passwordHash: HASH,
    createdAt,
    emailVerified: true,
    adultConfirmed: true,
    deletedAt: null,
  };
}

export function buildSeed(): DBState {
  const users: User[] = [
    user(DEMO_IDS.client, 'client', 'Casey Nguyen', 'casey@demo.legalgrads.test'),
    user(DEMO_IDS.client2, 'client', 'Sam Rivera', 'sam@demo.legalgrads.test'),
    user(DEMO_IDS.admin, 'admin', 'Demo Admin', 'admin@demo.legalgrads.test'),
    user(DEMO_IDS.system, 'system', 'Legalgrads Notices', 'notices@demo.legalgrads.test'),
    user('user_maya', 'attorney', 'Maya R.', 'maya@demo.legalgrads.test'),
    user('user_jordan', 'attorney', 'Jordan K.', 'jordan@demo.legalgrads.test'),
    user('user_samantha', 'attorney', 'Samantha L.', 'samantha@demo.legalgrads.test'),
    user('user_chris', 'attorney', 'Chris T.', 'chris@demo.legalgrads.test'),
    user('user_emily', 'attorney', 'Emily W.', 'emily@demo.legalgrads.test'),
    user('user_daniel', 'attorney', 'Daniel M.', 'daniel@demo.legalgrads.test'),
    user('user_alex', 'attorney', 'Alex J.', 'alex@demo.legalgrads.test'),
    user('user_taylor', 'attorney', 'Taylor H.', 'taylor@demo.legalgrads.test'),
    user('user_kevin', 'attorney', 'Kevin S.', 'kevin@demo.legalgrads.test'),
    user('user_brianna', 'attorney', 'Brianna C.', 'brianna@demo.legalgrads.test'),
    user('user_ryan', 'attorney', 'Ryan P.', 'ryan.p@demo.legalgrads.test'),
    user('user_nicole', 'attorney', 'Nicole A.', 'nicole@demo.legalgrads.test'),
  ];

  const attorneyProfiles: AttorneyProfile[] = [
    {
      userId: 'user_maya',
      slug: 'maya-r',
      displayName: 'Maya R., Esq.',
      firstName: 'Maya',
      bio: 'Fictional demo attorney focused on contracts, small-business formation, and residential real estate paperwork for people in California. This is not a real lawyer and not a real solicitation.',
      lawSchool: 'UC Law',
      graduationYear: 2026,
      admissionDate: '2026-01-15',
      licenseJurisdictions: ['CA'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2026-02-02',
      hourlyRate: 150,
      photoUrl: '/headshots/01_maya.png',
      languages: ['English', 'Spanish'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Los Angeles',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 4,
      cardTags: ['Contracts', 'Business Law', 'Real Estate'],
    },
    {
      userId: 'user_jordan',
      slug: 'jordan-k',
      displayName: 'Jordan K., Esq.',
      firstName: 'Jordan',
      bio: 'Fictional demo attorney helping New York founders with LLC paperwork and early intellectual-property questions. Schools, rates, and credentials on this profile are invented.',
      lawSchool: 'NYU Law',
      graduationYear: 2025,
      admissionDate: '2025-06-20',
      licenseJurisdictions: ['NY'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2025-07-08',
      hourlyRate: 175,
      photoUrl: '/headshots/02_jordan.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'New York',
      timezone: 'America/New_York',
      responseTimeHours: 6,
      cardTags: ['LLC Setup', 'Corporate Law', 'IP Law'],
    },
    {
      userId: 'user_samantha',
      slug: 'samantha-l',
      displayName: 'Samantha L., Esq.',
      firstName: 'Samantha',
      bio: 'Fictional demo attorney in the District of Columbia covering employment documents, contracts, and consumer questions. Not a real bar member.',
      lawSchool: 'Georgetown Law',
      graduationYear: 2025,
      admissionDate: '2025-11-12',
      licenseJurisdictions: ['DC'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2025-12-01',
      hourlyRate: 140,
      photoUrl: '/headshots/03_samantha.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: false,
      isPublished: true,
      city: 'Washington',
      timezone: 'America/New_York',
      responseTimeHours: 5,
      cardTags: ['Employment', 'Contracts', 'Consumer Rights'],
    },
    {
      userId: 'user_chris',
      slug: 'chris-t',
      displayName: 'Chris T., Esq.',
      firstName: 'Chris',
      bio: 'Fictional demo attorney in California reviewing leases, purchase agreements, and related contracts. Demo data only.',
      lawSchool: 'UCLA Law',
      graduationYear: 2025,
      admissionDate: '2025-12-03',
      licenseJurisdictions: ['CA'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2026-01-06',
      hourlyRate: 125,
      photoUrl: '/headshots/04_chris.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Los Angeles',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 8,
      cardTags: ['Real Estate', 'Contracts', 'Consumer Rights'],
    },
    {
      userId: 'user_emily',
      slug: 'emily-w',
      displayName: 'Emily W., Esq.',
      firstName: 'Emily',
      bio: 'Fictional demo attorney in Texas for simple estate-planning documents and family-law consultations. Invented profile.',
      lawSchool: 'UT Law',
      graduationYear: 2024,
      admissionDate: '2024-11-01',
      licenseJurisdictions: ['TX'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2024-11-20',
      hourlyRate: 135,
      photoUrl: '/headshots/05_emily.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Austin',
      timezone: 'America/Chicago',
      responseTimeHours: 7,
      cardTags: ['Estate Planning', 'Family Law'],
    },
    {
      userId: 'user_daniel',
      slug: 'daniel-m',
      displayName: 'Daniel M., Esq.',
      firstName: 'Daniel',
      bio: 'Fictional profile admitted in 2019, outside the demo newly licensed window. Included to prove search hides out-of-window attorneys. Not a real person.',
      lawSchool: 'Northwestern Pritzker',
      graduationYear: 2018,
      admissionDate: '2019-06-01',
      licenseJurisdictions: ['IL'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2019-07-01',
      hourlyRate: 220,
      photoUrl: '/headshots/06_daniel.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Chicago',
      timezone: 'America/Chicago',
      responseTimeHours: 12,
      cardTags: ['Contracts', 'Intellectual Property'],
    },
    {
      userId: 'user_alex',
      slug: 'alex-j',
      displayName: 'Alex J., Esq.',
      firstName: 'Alex',
      bio: 'Fictional demo attorney in California for employment documents and consumer questions. Demo credentials only.',
      lawSchool: 'UC Law',
      graduationYear: 2024,
      admissionDate: '2024-12-10',
      licenseJurisdictions: ['CA'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2025-01-08',
      hourlyRate: 130,
      photoUrl: '/headshots/07_alex.png',
      languages: ['English', 'Mandarin'],
      remoteAllowed: true,
      inPersonAllowed: false,
      isPublished: true,
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 3,
      cardTags: ['Employment', 'Consumer Rights'],
    },
    {
      userId: 'user_taylor',
      slug: 'taylor-h',
      displayName: 'Taylor H., Esq.',
      firstName: 'Taylor',
      bio: 'Fictional demo attorney in New York for estate-planning documents and family-law consultations. Not a real graduate.',
      lawSchool: 'Fordham Law',
      graduationYear: 2025,
      admissionDate: '2025-09-18',
      licenseJurisdictions: ['NY'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2025-10-02',
      hourlyRate: 160,
      photoUrl: '/headshots/08_taylor.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Brooklyn',
      timezone: 'America/New_York',
      responseTimeHours: 9,
      cardTags: ['Estate Planning', 'Family Law'],
    },
    {
      userId: 'user_kevin',
      slug: 'kevin-s',
      displayName: 'Kevin S., Esq.',
      firstName: 'Kevin',
      bio: 'Fictional attorney whose simulated verification is still pending. Hidden from search until a demo admin approves and the profile is published.',
      lawSchool: 'Stanford Law',
      graduationYear: 2025,
      admissionDate: '2025-08-01',
      licenseJurisdictions: ['CA'],
      licenseStatus: 'active',
      verificationStatus: 'pending',
      verificationDate: null,
      hourlyRate: 160,
      photoUrl: '/headshots/09_kevin.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: false,
      city: 'San Jose',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 10,
      cardTags: ['Contracts', 'Start a Business'],
    },
    {
      userId: 'user_brianna',
      slug: 'brianna-c',
      displayName: 'Brianna C., Esq.',
      firstName: 'Brianna',
      bio: 'Fictional demo attorney in Washington for operating agreements and contractor paperwork. Invented profile.',
      lawSchool: 'UW Law',
      graduationYear: 2025,
      admissionDate: '2025-10-22',
      licenseJurisdictions: ['WA'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2025-11-05',
      hourlyRate: 145,
      photoUrl: '/headshots/10_brianna.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Seattle',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 5,
      cardTags: ['Start a Business', 'Contracts'],
    },
    {
      userId: 'user_ryan',
      slug: 'ryan-p',
      displayName: 'Ryan P.',
      firstName: 'Ryan',
      bio: 'Fictional law graduate who is not yet admitted. Draft profile only. Cannot publish, appear in search, or accept legal matters.',
      lawSchool: 'UCLA Law',
      graduationYear: 2026,
      admissionDate: null,
      licenseJurisdictions: ['CA'],
      licenseStatus: 'not_admitted',
      verificationStatus: 'pending',
      verificationDate: null,
      hourlyRate: 0,
      photoUrl: '/headshots/11_ryan.png',
      languages: ['English'],
      remoteAllowed: true,
      inPersonAllowed: false,
      isPublished: false,
      city: 'Los Angeles',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 24,
      cardTags: ['Contracts'],
    },
    {
      userId: 'user_nicole',
      slug: 'nicole-a',
      displayName: 'Nicole A., Esq.',
      firstName: 'Nicole',
      bio: 'Fictional newly licensed California attorney with zero reviews. New attorneys can legitimately have no reviews. Demo profile only.',
      lawSchool: 'UC Davis Law',
      graduationYear: 2026,
      admissionDate: '2026-05-20',
      licenseJurisdictions: ['CA'],
      licenseStatus: 'active',
      verificationStatus: 'approved',
      verificationDate: '2026-06-03',
      hourlyRate: 120,
      photoUrl: '/headshots/12_nicole.png',
      languages: ['English', 'Korean'],
      remoteAllowed: true,
      inPersonAllowed: true,
      isPublished: true,
      city: 'Sacramento',
      timezone: 'America/Los_Angeles',
      responseTimeHours: 2,
      cardTags: ['Real Estate', 'Contracts'],
    },
  ];

  const links: Record<string, string[]> = {
    user_maya: ['spec_contracts', 'spec_business', 'spec_real_estate'],
    user_jordan: ['spec_business', 'spec_ip'],
    user_samantha: ['spec_employment', 'spec_contracts', 'spec_consumer'],
    user_chris: ['spec_real_estate', 'spec_contracts', 'spec_consumer'],
    user_emily: ['spec_estate', 'spec_family'],
    user_daniel: ['spec_contracts', 'spec_ip'],
    user_alex: ['spec_employment', 'spec_consumer'],
    user_taylor: ['spec_estate', 'spec_family'],
    user_kevin: ['spec_contracts', 'spec_business'],
    user_brianna: ['spec_business', 'spec_contracts'],
    user_ryan: ['spec_contracts'],
    user_nicole: ['spec_real_estate', 'spec_contracts'],
  };
  const attorneySpecialties: AttorneySpecialty[] = Object.entries(links).flatMap(([attorneyId, specs]) =>
    specs.map((specialtyId) => ({ attorneyId, specialtyId })),
  );

  const services: Service[] = [
    svc('svc_maya_1', 'user_maya', 'Contract Review', 149, 3, 'Read a draft agreement and send written comments.', 'Comment memo', 'No negotiation with the other party', true),
    svc('svc_maya_2', 'user_maya', 'Business Formation Help', 349, 7, 'Prepare a basic LLC formation checklist and template operating agreement.', 'Checklist and template', 'No tax advice and no filing fees', true),
    svc('svc_jordan_1', 'user_jordan', 'LLC Setup Package', 499, 10, 'Walk through New York LLC formation documents.', 'Formation checklist', 'State filing fees excluded', true),
    svc('svc_jordan_2', 'user_jordan', 'IP Issue-Spotting Memo', 899, 14, 'A short memo flagging brand and IP questions. Not a clearance opinion.', 'Memo', 'No USPTO filing', false),
    svc('svc_sam_1', 'user_samantha', 'Employee Handbook Review', 399, 7, 'Comments on a short handbook draft.', 'Comment memo', 'No workplace investigation', true),
    svc('svc_sam_2', 'user_samantha', 'Offer Letter Review', 149, 2, 'Review one offer letter.', 'Marked comments', 'No negotiation', true),
    svc('svc_chris_1', 'user_chris', 'Residential Lease Review', 199, 3, 'Review one residential lease.', 'Issue list', 'No landlord negotiation', true),
    svc('svc_chris_2', 'user_chris', 'Purchase Contract Review', 349, 4, 'Review one residential purchase agreement.', 'Comment memo', 'No title search', true),
    svc('svc_emily_1', 'user_emily', 'Simple Will Package', 299, 10, 'Prepare a basic will from a questionnaire.', 'Draft will', 'No trust funding', true),
    svc('svc_emily_2', 'user_emily', 'Power of Attorney', 199, 7, 'Prepare a statutory power of attorney.', 'Draft document', 'No medical advice', false),
    svc('svc_daniel_1', 'user_daniel', 'Contract Markup', 220, 4, 'Out-of-window sample service. Not bookable.', 'Markup', 'Not offered publicly', false),
    svc('svc_alex_1', 'user_alex', 'Severance Agreement Review', 299, 3, 'Review one severance agreement.', 'Comment memo', 'No litigation', true),
    svc('svc_alex_2', 'user_alex', 'Wage Question Letter', 249, 5, 'Draft a short letter about a wage question.', 'Draft letter', 'No agency filing', true),
    svc('svc_taylor_1', 'user_taylor', 'Healthcare Directive', 220, 7, 'Prepare a basic healthcare directive.', 'Draft document', 'No medical advice', true),
    svc('svc_taylor_2', 'user_taylor', 'Estate Planning Intake', 180, 5, 'Questionnaire and planning memo.', 'Memo', 'No tax opinion', true),
    svc('svc_kevin_1', 'user_kevin', 'Contract Review Draft', 160, 3, 'Unpublished draft service.', 'Comments', 'Not public', true),
    svc('svc_bri_1', 'user_brianna', 'Operating Agreement', 450, 10, 'Draft a simple single-member operating agreement.', 'Draft agreement', 'No tax advice', true),
    svc('svc_bri_2', 'user_brianna', 'Contractor Agreement Review', 275, 4, 'Review one independent-contractor agreement.', 'Comments', 'No employment audit', true),
    svc('svc_nicole_1', 'user_nicole', 'Buyer Consult Package', 125, 2, 'A fixed-price consult about a home purchase.', 'Consult notes', 'No brokerage', true),
    svc('svc_nicole_2', 'user_nicole', 'Lease Review', 180, 3, 'Review one residential lease.', 'Issue list', 'No negotiation', true),
  ];

  const slots: AvailabilitySlot[] = [];
  const addSlot = (id: string, attorneyId: string, start: string, status: AvailabilitySlot['status'] = 'open') => {
    const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
    slots.push({ id, attorneyId, startAtUtc: start, endAtUtc: end, status });
  };
  addSlot('slot_maya_1', 'user_maya', '2026-11-03T16:00:00.000Z');
  addSlot('slot_maya_2', 'user_maya', '2026-11-05T18:00:00.000Z');
  addSlot('slot_maya_3', 'user_maya', '2026-11-12T16:00:00.000Z');
  addSlot('slot_jordan_1', 'user_jordan', '2026-11-04T15:00:00.000Z', 'held');
  addSlot('slot_jordan_2', 'user_jordan', '2026-11-18T15:00:00.000Z');
  addSlot('slot_sam_1', 'user_samantha', '2026-11-06T15:00:00.000Z');
  addSlot('slot_sam_2', 'user_samantha', '2026-11-20T15:00:00.000Z');
  addSlot('slot_chris_1', 'user_chris', '2026-11-04T17:00:00.000Z', 'booked');
  addSlot('slot_chris_2', 'user_chris', '2026-11-13T17:00:00.000Z');
  addSlot('slot_emily_1', 'user_emily', '2026-11-07T16:00:00.000Z');
  addSlot('slot_emily_2', 'user_emily', '2026-11-21T16:00:00.000Z');
  addSlot('slot_daniel_1', 'user_daniel', '2026-11-08T16:00:00.000Z');
  addSlot('slot_alex_1', 'user_alex', '2026-11-09T17:00:00.000Z');
  addSlot('slot_alex_2', 'user_alex', '2026-11-16T17:00:00.000Z');
  addSlot('slot_taylor_1', 'user_taylor', '2026-11-10T15:00:00.000Z', 'booked');
  addSlot('slot_taylor_2', 'user_taylor', '2026-11-17T15:00:00.000Z');
  addSlot('slot_kevin_1', 'user_kevin', '2026-11-11T17:00:00.000Z');
  addSlot('slot_bri_1', 'user_brianna', '2026-11-12T18:00:00.000Z', 'booked');
  addSlot('slot_bri_2', 'user_brianna', '2026-11-19T18:00:00.000Z');
  addSlot('slot_ryan_1', 'user_ryan', '2026-11-14T17:00:00.000Z', 'blocked');
  addSlot('slot_nicole_1', 'user_nicole', '2026-11-06T17:00:00.000Z');
  addSlot('slot_nicole_2', 'user_nicole', '2026-11-13T17:00:00.000Z');

  const inquiries: Inquiry[] = [
    inq('inq_casey_maya', 'user_casey', 'user_maya', 'spec_contracts', null, 'consultation', 'Please review a fictional demo NDA. Do not treat this as a real confidential matter.', '$250–$750', 'This month', 'CA', 'inquiry', T3),
    inq('inq_casey_chris', 'user_casey', 'user_chris', 'spec_real_estate', 'svc_chris_1', 'fixed_price', 'Fictional demo lease review already under engagement.', '$250–$750', 'This month', 'CA', 'active', T1),
    inq('inq_casey_alex', 'user_casey', 'user_alex', 'spec_employment', 'svc_alex_1', 'fixed_price', 'Fictional completed severance review.', '$250–$750', 'Flexible', 'CA', 'completed', T0),
    inq('inq_casey_bri', 'user_casey', 'user_brianna', 'spec_business', 'svc_bri_2', 'fixed_price', 'Fictional contractor agreement for a Washington project.', '$250–$750', 'This month', 'WA', 'active', T2),
    inq('inq_sam_jordan', 'user_sam', 'user_jordan', 'spec_ip', null, 'consultation', 'Fictional brand-name question. Conflict review is still open.', '$750–$2,000', 'This month', 'NY', 'conflict_review', T3),
    inq('inq_sam_taylor', 'user_sam', 'user_taylor', 'spec_estate', 'svc_taylor_2', 'fixed_price', 'Fictional estate-planning intake in progress.', 'Under $250', 'Flexible', 'NY', 'active', T1),
    inq('inq_sam_emily', 'user_sam', 'user_emily', 'spec_estate', 'svc_emily_2', 'fixed_price', 'Fictional completed power of attorney.', 'Under $250', 'Flexible', 'TX', 'completed', T0),
    inq('inq_casey_sam', 'user_casey', 'user_samantha', 'spec_employment', 'svc_sam_2', 'quote', 'Fictional quote request for an offer letter with a DC employer.', 'Under $250', 'This week', 'DC', 'proposal_sent', T2),
  ];

  const conversations: Conversation[] = [
    { id: 'convo_casey_maya', inquiryId: 'inq_casey_maya', matterId: null },
    { id: 'convo_casey_chris', inquiryId: 'inq_casey_chris', matterId: 'matter_chris' },
    { id: 'convo_casey_alex', inquiryId: 'inq_casey_alex', matterId: 'matter_alex' },
    { id: 'convo_sam_jordan', inquiryId: 'inq_sam_jordan', matterId: null },
    { id: 'convo_sam_taylor', inquiryId: 'inq_sam_taylor', matterId: 'matter_taylor' },
    { id: 'convo_casey_sam', inquiryId: 'inq_casey_sam', matterId: null },
  ];
  const conversationMembers: ConversationMember[] = [
    ['convo_casey_maya', 'user_casey'],
    ['convo_casey_maya', 'user_maya'],
    ['convo_casey_chris', 'user_casey'],
    ['convo_casey_chris', 'user_chris'],
    ['convo_casey_alex', 'user_casey'],
    ['convo_casey_alex', 'user_alex'],
    ['convo_sam_jordan', 'user_sam'],
    ['convo_sam_jordan', 'user_jordan'],
    ['convo_sam_taylor', 'user_sam'],
    ['convo_sam_taylor', 'user_taylor'],
    ['convo_casey_sam', 'user_casey'],
    ['convo_casey_sam', 'user_samantha'],
  ].map(([conversationId, userId]) => ({ conversationId, userId }));

  const messages: Message[] = [
    msg('msg_1', 'convo_casey_maya', DEMO_IDS.system, 'system', 'Privacy notice: do not share privileged or highly sensitive facts in this marketplace thread. A request does not create an attorney-client relationship. Fictional demo only.', T3, T3),
    msg('msg_2', 'convo_casey_maya', 'user_casey', 'text', 'Hi Maya — this is a fictional demo note about an NDA. No real confidential facts here.', T3, null),
    msg('msg_3', 'convo_casey_chris', DEMO_IDS.system, 'system', 'Engagement is active in this demo. Still do not upload real client documents.', T1, T1),
    msg('msg_4', 'convo_casey_chris', 'user_chris', 'text', 'Demo update: I started the fictional lease comments.', T2, T2),
    msg('msg_5', 'convo_casey_chris', 'user_chris', 'attachment', 'demo-lease-comments.pdf — fictional demo fixture. No file was uploaded.', T2, null),
    msg('msg_6', 'convo_casey_alex', 'user_alex', 'text', 'Fictional demo: the sample severance review is complete.', T1, T1),
    msg('msg_7', 'convo_sam_jordan', DEMO_IDS.system, 'system', 'Conflict review is still open. Do not send sensitive facts yet.', T3, T3),
    msg('msg_8', 'convo_sam_jordan', 'user_sam', 'text', 'Fictional question about a made-up brand name.', T3, null),
    msg('msg_9', 'convo_sam_taylor', 'user_taylor', 'text', 'Demo milestone: questionnaire received. This is not a real estate plan.', T2, T2),
    msg('msg_10', 'convo_casey_sam', DEMO_IDS.system, 'system', 'A proposal is waiting. Review the scope before accepting. Demo only.', T2, T2),
    msg('msg_11', 'convo_casey_sam', 'user_samantha', 'text', 'I sent a fictional fixed-fee proposal for the offer-letter review.', T2, null),
  ];

  const appointments: Appointment[] = [
    { id: 'appt_chris', inquiryId: 'inq_casey_chris', attorneyId: 'user_chris', clientId: 'user_casey', slotId: 'slot_chris_1', status: 'confirmed', meetingMode: 'remote', meetingLink: 'https://demo.legalgrads.test/meet/DEMO-CHRIS', createdAt: T1 },
    { id: 'appt_taylor', inquiryId: 'inq_sam_taylor', attorneyId: 'user_taylor', clientId: 'user_sam', slotId: 'slot_taylor_1', status: 'confirmed', meetingMode: 'remote', meetingLink: 'https://demo.legalgrads.test/meet/DEMO-TAYLOR', createdAt: T1 },
    { id: 'appt_bri', inquiryId: 'inq_casey_bri', attorneyId: 'user_brianna', clientId: 'user_casey', slotId: 'slot_bri_1', status: 'confirmed', meetingMode: 'remote', meetingLink: 'https://demo.legalgrads.test/meet/DEMO-BRI', createdAt: T2 },
    { id: 'appt_jordan', inquiryId: 'inq_sam_jordan', attorneyId: 'user_jordan', clientId: 'user_sam', slotId: 'slot_jordan_1', status: 'proposed', meetingMode: 'remote', meetingLink: null, createdAt: T3 },
  ];

  const conflictChecks: ConflictCheck[] = [
    { id: 'cc_chris', inquiryId: 'inq_casey_chris', attorneyId: 'user_chris', status: 'cleared', checkedAt: T1, notes: 'Simulated conflict check cleared. Not a real conflicts database.' },
    { id: 'cc_alex', inquiryId: 'inq_casey_alex', attorneyId: 'user_alex', status: 'cleared', checkedAt: T0, notes: 'Simulated clear.' },
    { id: 'cc_bri', inquiryId: 'inq_casey_bri', attorneyId: 'user_brianna', status: 'cleared', checkedAt: T2, notes: 'Simulated clear.' },
    { id: 'cc_jordan', inquiryId: 'inq_sam_jordan', attorneyId: 'user_jordan', status: 'pending', checkedAt: null, notes: 'Awaiting simulated conflict review.' },
    { id: 'cc_taylor', inquiryId: 'inq_sam_taylor', attorneyId: 'user_taylor', status: 'cleared', checkedAt: T1, notes: 'Simulated clear.' },
    { id: 'cc_emily', inquiryId: 'inq_sam_emily', attorneyId: 'user_emily', status: 'cleared', checkedAt: T0, notes: 'Simulated clear.' },
    { id: 'cc_samantha', inquiryId: 'inq_casey_sam', attorneyId: 'user_samantha', status: 'cleared', checkedAt: T2, notes: 'Simulated clear before proposal.' },
  ];

  const proposals: Proposal[] = [
    prop('prop_chris', 'inq_casey_chris', 'user_chris', 'Fictional lease review', 199, 'accepted', T1),
    prop('prop_alex', 'inq_casey_alex', 'user_alex', 'Fictional severance review', 299, 'accepted', T0),
    prop('prop_bri', 'inq_casey_bri', 'user_brianna', 'Fictional contractor-agreement review', 275, 'accepted', T2),
    prop('prop_taylor', 'inq_sam_taylor', 'user_taylor', 'Fictional estate intake', 180, 'accepted', T1),
    prop('prop_emily', 'inq_sam_emily', 'user_emily', 'Fictional power of attorney', 199, 'accepted', T0),
    prop('prop_sam', 'inq_casey_sam', 'user_samantha', 'Fictional offer-letter review', 149, 'sent', T2),
  ];

  const engagements: Engagement[] = [
    { id: 'eng_chris', proposalId: 'prop_chris', clientAcceptedAt: T1, attorneyAcceptedAt: T1, status: 'active' },
    { id: 'eng_alex', proposalId: 'prop_alex', clientAcceptedAt: T0, attorneyAcceptedAt: T0, status: 'ended' },
    { id: 'eng_bri', proposalId: 'prop_bri', clientAcceptedAt: T2, attorneyAcceptedAt: T2, status: 'active' },
    { id: 'eng_taylor', proposalId: 'prop_taylor', clientAcceptedAt: T1, attorneyAcceptedAt: T1, status: 'active' },
    { id: 'eng_emily', proposalId: 'prop_emily', clientAcceptedAt: T0, attorneyAcceptedAt: T0, status: 'ended' },
  ];

  const matters: Matter[] = [
    { id: 'matter_chris', engagementId: 'eng_chris', inquiryId: 'inq_casey_chris', clientId: 'user_casey', attorneyId: 'user_chris', status: 'active', startedAt: T1, completedAt: null },
    { id: 'matter_bri', engagementId: 'eng_bri', inquiryId: 'inq_casey_bri', clientId: 'user_casey', attorneyId: 'user_brianna', status: 'active', startedAt: T2, completedAt: null },
    { id: 'matter_taylor', engagementId: 'eng_taylor', inquiryId: 'inq_sam_taylor', clientId: 'user_sam', attorneyId: 'user_taylor', status: 'active', startedAt: T1, completedAt: null },
    { id: 'matter_alex', engagementId: 'eng_alex', inquiryId: 'inq_casey_alex', clientId: 'user_casey', attorneyId: 'user_alex', status: 'completed', startedAt: T0, completedAt: T1 },
    { id: 'matter_emily', engagementId: 'eng_emily', inquiryId: 'inq_sam_emily', clientId: 'user_sam', attorneyId: 'user_emily', status: 'completed', startedAt: T0, completedAt: T1 },
  ];

  const matterMilestones: MatterMilestone[] = [
    { id: 'ms_chris_1', matterId: 'matter_chris', title: 'Read fictional lease', dueAt: '2026-11-01', status: 'done' },
    { id: 'ms_chris_2', matterId: 'matter_chris', title: 'Send demo comments', dueAt: '2026-11-08', status: 'pending' },
    { id: 'ms_bri_1', matterId: 'matter_bri', title: 'Collect fictional facts', dueAt: '2026-11-05', status: 'done' },
    { id: 'ms_bri_2', matterId: 'matter_bri', title: 'Draft demo comments', dueAt: '2026-11-12', status: 'pending' },
    { id: 'ms_tay_1', matterId: 'matter_taylor', title: 'Review fictional questionnaire', dueAt: '2026-11-03', status: 'pending' },
    { id: 'ms_tay_2', matterId: 'matter_taylor', title: 'Prepare demo memo', dueAt: '2026-11-15', status: 'pending' },
    { id: 'ms_alex_1', matterId: 'matter_alex', title: 'Deliver fictional review', dueAt: '2026-09-20', status: 'done' },
    { id: 'ms_emily_1', matterId: 'matter_emily', title: 'Deliver fictional document', dueAt: '2026-09-20', status: 'done' },
  ];

  const demoPayments: DemoPayment[] = [
    { id: 'pay_chris', matterId: 'matter_chris', amount: 199, status: 'paid', simulated: true, createdAt: T1 },
    { id: 'pay_bri', matterId: 'matter_bri', amount: 275, status: 'paid', simulated: true, createdAt: T2 },
    { id: 'pay_taylor', matterId: 'matter_taylor', amount: 180, status: 'paid', simulated: true, createdAt: T1 },
    { id: 'pay_alex', matterId: 'matter_alex', amount: 299, status: 'paid', simulated: true, createdAt: T0 },
    { id: 'pay_emily', matterId: 'matter_emily', amount: 199, status: 'paid', simulated: true, createdAt: T0 },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_alex',
      matterId: 'matter_alex',
      clientId: 'user_casey',
      attorneyId: 'user_alex',
      rating: 5,
      text: 'Fictional demo review: the sample severance comments were clear. This is not a real client testimonial.',
      isDemo: true,
      createdAt: '2026-09-20T15:00:00.000Z',
      updatedAt: '2026-09-20T15:00:00.000Z',
      moderation: 'visible',
    },
    {
      id: 'rev_emily',
      matterId: 'matter_emily',
      clientId: 'user_sam',
      attorneyId: 'user_emily',
      rating: 5,
      text: 'Fictional demo review: the sample document matched the made-up questionnaire. Not a real review.',
      isDemo: true,
      createdAt: '2026-09-21T15:00:00.000Z',
      updatedAt: '2026-09-21T15:00:00.000Z',
      moderation: 'visible',
    },
  ];

  const notifications: Notification[] = [
    { id: 'nt_1', userId: 'user_maya', type: 'lead', body: 'New fictional demo inquiry from Casey Nguyen.', readAt: null, createdAt: T3, href: '/attorney/leads/?id=inq_casey_maya' },
    { id: 'nt_2', userId: 'user_casey', type: 'appointment', body: 'Simulated email: your demo consult with Chris T. is confirmed. No email was sent.', readAt: null, createdAt: T1, href: '/client/appointments/' },
    { id: 'nt_3', userId: 'user_casey', type: 'proposal', body: 'Samantha L. sent a fictional proposal. Simulated alert only.', readAt: null, createdAt: T2, href: '/client/requests/?id=inq_casey_sam' },
    { id: 'nt_4', userId: 'user_sam', type: 'appointment', body: 'Jordan K. proposed a demo consult time.', readAt: null, createdAt: T3, href: '/client/appointments/' },
    { id: 'nt_5', userId: 'user_jordan', type: 'lead', body: 'Conflict review is still open on Sam Rivera’s fictional inquiry.', readAt: T3, createdAt: T3, href: '/attorney/leads/?id=inq_sam_jordan' },
  ];

  const activityEvents: ActivityEvent[] = [
    { id: 'act_1', actorId: 'user_casey', objectType: 'inquiry', objectId: 'inq_casey_maya', action: 'created', summary: 'Casey opened a fictional consult request with Maya.', createdAt: T3 },
    { id: 'act_2', actorId: 'user_samantha', objectType: 'proposal', objectId: 'prop_sam', action: 'sent', summary: 'Samantha sent a fictional proposal.', createdAt: T2 },
    { id: 'act_3', actorId: 'user_chris', objectType: 'matter', objectId: 'matter_chris', action: 'started', summary: 'Demo matter with Chris became active after simulated payment.', createdAt: T1 },
    { id: 'act_4', actorId: 'user_alex', objectType: 'matter', objectId: 'matter_alex', action: 'completed', summary: 'Demo matter with Alex was marked completed.', createdAt: T1 },
    { id: 'act_5', actorId: DEMO_IDS.system, objectType: 'settings', objectId: 'seed', action: 'seeded', summary: 'Demo dataset loaded. All records are fictional.', createdAt: T0 },
  ];

  const termsAcceptances: TermsAcceptance[] = users
    .filter((u) => u.role !== 'system')
    .map((u) => ({ id: `terms_${u.id}`, userId: u.id, version: TERMS_VERSION, acceptedAt: T0 }));

  return {
    seedVersion: SEED_VERSION,
    settings: {
      termsVersion: TERMS_VERSION,
      termsUpdatedAt: TERMS_UPDATED_AT,
      eligibilityWindowYears: 3,
    },
    users,
    clientProfiles: [
      { userId: 'user_casey', location: 'Los Angeles', state: 'CA', preferences: 'Remote help preferred. Fictional demo client.' },
      { userId: 'user_sam', location: 'Brooklyn', state: 'NY', preferences: 'Either remote or in person. Fictional demo client.' },
    ],
    attorneyProfiles,
    specialties: SPECIALTIES.map((s) => ({ ...s })),
    attorneySpecialties,
    services,
    availabilitySlots: slots,
    favorites: [],
    inquiries,
    conversations,
    conversationMembers,
    messages,
    appointments,
    conflictChecks,
    proposals,
    engagements,
    matters,
    matterMilestones,
    demoPayments,
    reviews,
    notifications,
    activityEvents,
    waitlistEntries: [],
    privacyRequests: [],
    reports: [],
    termsAcceptances,
    passwordResets: [],
  };
}

function svc(
  id: string,
  attorneyId: string,
  title: string,
  fixedPrice: number,
  turnaroundDays: number,
  scope: string,
  deliverables: string,
  exclusions: string,
  consultationIncluded: boolean,
): Service {
  return {
    id,
    attorneyId,
    title,
    scope,
    deliverables,
    exclusions,
    fixedPrice,
    turnaroundDays,
    active: true,
    consultationIncluded,
  };
}

function inq(
  id: string,
  clientId: string,
  attorneyId: string,
  specialtyId: string,
  serviceId: string | null,
  kind: Inquiry['kind'],
  description: string,
  budget: string,
  urgency: string,
  jurisdiction: string,
  status: Inquiry['status'],
  createdAt: string,
): Inquiry {
  return {
    id,
    clientId,
    attorneyId,
    specialtyId,
    serviceId,
    kind,
    description,
    budget,
    urgency,
    jurisdiction,
    contactPreference: 'Email in the demo only',
    durationMinutes: 30,
    status,
    createdAt,
  };
}

function msg(
  id: string,
  conversationId: string,
  senderId: string,
  kind: Message['kind'],
  body: string,
  createdAt: string,
  readAt: string | null,
): Message {
  return { id, conversationId, senderId, body, createdAt, readAt, kind };
}

function prop(
  id: string,
  inquiryId: string,
  attorneyId: string,
  scope: string,
  price: number,
  status: Proposal['status'],
  createdAt: string,
): Proposal {
  return {
    id,
    inquiryId,
    attorneyId,
    scope,
    deliverables: 'Written comments or a draft, as described. Fictional demo.',
    exclusions: 'No court appearance, no guarantee of outcome, no real funds.',
    priceType: 'fixed',
    price,
    deadline: '2026-12-15',
    revisions: 'One round of factual corrections',
    jurisdiction: 'As stated on the inquiry',
    expiresAt: '2026-12-01',
    status,
    createdAt,
  };
}

let preview: DBState | null = null;
export function previewState(): DBState {
  if (!preview) preview = buildSeed();
  return preview;
}
