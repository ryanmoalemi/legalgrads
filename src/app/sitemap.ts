import type { MetadataRoute } from 'next';
import { SPECIALTIES } from '@/lib/catalog';
import { NATIONAL_STATES } from '@/lib/nationalPostBar';
import { TRACKER_PATH } from '@/lib/postBar';
import { REAL_PROFILES, cityGroups, cityPath, profilePath } from '@/lib/profiles';
export const dynamic = 'force-static';
const B = 'https://legalgrads.com';
const STATIC = ['/', '/find-lawyer/', '/for-attorneys/', '/how-it-works/', '/pricing/', '/faq/', '/about/', '/specialties/', '/join/', '/contact/', '/cookie-settings/', '/privacy-request/', '/do-not-sell-or-share/', '/attorney-advertising/',
  '/privacy/', '/terms/', '/disclaimers/', '/directory-disclosure/', '/attorney-terms/',
  '/accessibility/', '/security/', '/cookies/', '/legal/', '/data-deletion/', '/report-abuse/', '/how-we-build-legalgrads/', '/sitemap/', '/resources/post-bar-licensing-tracker/', '/resources/post-bar-licensing-tracker/california/', '/resources/post-bar-licensing-tracker/california/retake/', '/resources/post-bar-licensing-tracker/new-york/'];
const CHUNK = 45000;

function allItems(): MetadataRoute.Sitemap {
  const groups = cityGroups();
  return [
    ...STATIC.map((p) => ({ url: B + p })),
    ...SPECIALTIES.map((s) => ({ url: `${B}/specialties/${s.slug}/` })),
    ...[...new Set(groups.map((g) => g.state))].map((s) => ({ url: `${B}/attorneys/${s}/` })),
    ...groups.map((g) => ({ url: B + cityPath(g.state, g.city) })),
    ...REAL_PROFILES.map((p) => ({ url: B + profilePath(p), ...(p.lastVerified ? { lastModified: new Date(p.lastVerified) } : {}) })),
    ...NATIONAL_STATES.filter((state) => !STATIC.includes(`${TRACKER_PATH}${state.slug}/`)).map((state) => ({ url: `${B}${TRACKER_PATH}${state.slug}/` })),
  ];
}

export async function generateSitemaps() {
  const parts = Math.max(1, Math.ceil(allItems().length / CHUNK));
  return Array.from({ length: parts }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const part = Number(await id);
  const items = allItems();
  const slice = items.slice(part * CHUNK, (part + 1) * CHUNK);
  if (slice.length > 50000) {
    throw new Error(`Sitemap part ${part} has ${slice.length} URLs.`);
  }
  return slice;
}
