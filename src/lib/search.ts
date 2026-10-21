import { DEMO_TODAY } from './catalog';
import { withinWindow } from './format';
import type { AttorneyCard, DBState, SearchFilters } from './types';

export function unavailableReason(state: DBState, userId: string): string | null {
  const profile = state.attorneyProfiles.find((p) => p.userId === userId);
  if (!profile) return 'Profile not found.';
  if (profile.licenseStatus !== 'active') {
    return 'Not admitted to a bar. A recent graduate who is not admitted cannot offer independent legal representation or appear as an attorney for hire.';
  }
  if (profile.verificationStatus !== 'approved') {
    return 'Simulated verification is not approved. This profile is hidden from search.';
  }
  if (!profile.isPublished) return 'This profile is an unpublished draft.';
  if (!withinWindow(profile.admissionDate, state.settings.eligibilityWindowYears)) {
    return `Outside the eligibility window (demo setting: within ${state.settings.eligibilityWindowYears} years of admission).`;
  }
  return null;
}

export function isBookable(state: DBState, userId: string): boolean {
  return unavailableReason(state, userId) === null;
}

export function specialtySlugsFor(state: DBState, attorneyId: string): string[] {
  const ids = state.attorneySpecialties.filter((row) => row.attorneyId === attorneyId).map((row) => row.specialtyId);
  return state.specialties.filter((s) => ids.includes(s.id)).map((s) => s.slug);
}

export function toCard(state: DBState, userId: string): AttorneyCard | null {
  const profile = state.attorneyProfiles.find((p) => p.userId === userId);
  if (!profile) return null;
  const slugs = specialtySlugsFor(state, userId);
  const names = slugs.map((slug) => state.specialties.find((s) => s.slug === slug)?.name ?? slug);
  const prices = state.services.filter((s) => s.attorneyId === userId && s.active).map((s) => s.fixedPrice);
  const reason = unavailableReason(state, userId);
  return {
    userId: profile.userId,
    slug: profile.slug,
    displayName: profile.displayName,
    firstName: profile.firstName,
    photoUrl: profile.photoUrl,
    city: profile.city,
    licenseJurisdictions: profile.licenseJurisdictions,
    lawSchool: profile.lawSchool,
    graduationYear: profile.graduationYear,
    admissionDate: profile.admissionDate,
    hourlyRate: profile.hourlyRate,
    bio: profile.bio,
    cardTags: profile.cardTags,
    specialtySlugs: slugs,
    specialtyNames: names,
    minFixedPrice: prices.length ? Math.min(...prices) : null,
    responseTimeHours: profile.responseTimeHours,
    remoteAllowed: profile.remoteAllowed,
    inPersonAllowed: profile.inPersonAllowed,
    languages: profile.languages,
    verificationStatus: profile.verificationStatus,
    verificationDate: profile.verificationDate,
    licenseStatus: profile.licenseStatus,
    bookable: reason === null,
    unavailableReason: reason,
    timezone: profile.timezone,
    fictional: true,
  };
}

function hasOpenSlot(state: DBState, attorneyId: string): boolean {
  const now = new Date(DEMO_TODAY).getTime();
  return state.availabilitySlots.some(
    (slot) => slot.attorneyId === attorneyId && slot.status === 'open' && new Date(slot.startAtUtc).getTime() > now,
  );
}

export function searchAttorneys(state: DBState, filters: SearchFilters = {}): AttorneyCard[] {
  const cards = state.attorneyProfiles
    .map((p) => toCard(state, p.userId))
    .filter((card): card is AttorneyCard => !!card && card.bookable);

  const q = (filters.q ?? '').trim().toLowerCase();
  let list = cards.filter((card) => {
    if (filters.jurisdiction && !card.licenseJurisdictions.includes(filters.jurisdiction)) return false;
    if (filters.specialties && filters.specialties.length) {
      const wanted = filters.specialties.filter(Boolean);
      if (wanted.length && !wanted.some((slug) => card.specialtySlugs.includes(slug))) return false;
    }
    if (typeof filters.rateMin === 'number' && card.hourlyRate < filters.rateMin) return false;
    if (typeof filters.rateMax === 'number' && card.hourlyRate > filters.rateMax) return false;
    if (filters.recentYears && !withinWindow(card.admissionDate, filters.recentYears)) return false;
    if (filters.fixedPrice && card.minFixedPrice === null) return false;
    if (filters.consultation && !hasOpenSlot(state, card.userId)) return false;
    if (filters.format === 'remote' && !card.remoteAllowed) return false;
    if (filters.format === 'in_person' && !card.inPersonAllowed) return false;
    if (q) {
      const services = state.services.filter((s) => s.attorneyId === card.userId).map((s) => s.title.toLowerCase());
      const hay = [card.displayName, card.bio, card.city, card.lawSchool, ...card.specialtyNames, ...card.cardTags, ...services]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sort = filters.sort ?? 'relevance';
  const rank = (card: AttorneyCard) => {
    if (card.slug === 'maya-r') return 0;
    if (card.slug === 'jordan-k') return 1;
    return 10;
  };
  list = [...list].sort((a, b) => {
    if (sort === 'price') return a.hourlyRate - b.hourlyRate;
    if (sort === 'newest') return (b.admissionDate ?? '').localeCompare(a.admissionDate ?? '');
    if (sort === 'response') return a.responseTimeHours - b.responseTimeHours;
    return rank(a) - rank(b) || a.displayName.localeCompare(b.displayName);
  });
  return list;
}
