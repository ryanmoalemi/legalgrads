import type { MetadataRoute } from 'next';
import { SPECIALTIES } from '@/lib/catalog';
import { REAL_PROFILES, cityGroups, cityPath, profilePath } from '@/lib/profiles';
export const dynamic = 'force-static';
const B = 'https://legalgrads.com';
const STATIC = ['/', '/find-lawyer/', '/for-attorneys/', '/how-it-works/', '/pricing/', '/faq/', '/about/', '/specialties/', '/join/', '/contact/', '/cookie-settings/', '/privacy-request/', '/do-not-sell-or-share/', '/attorney-advertising/',
  '/privacy/', '/terms/', '/disclaimers/', '/directory-disclosure/', '/attorney-terms/',
  '/accessibility/', '/security/', '/cookies/', '/legal/', '/data-deletion/', '/report-abuse/', '/how-we-build-legalgrads/', '/sitemap/', '/resources/post-bar-licensing-tracker/', '/resources/post-bar-licensing-tracker/california/', '/resources/post-bar-licensing-tracker/new-york/'];
export default function sitemap(): MetadataRoute.Sitemap {
  const groups = cityGroups();
  return [
    ...STATIC.map((p) => ({ url: B + p })),
    ...SPECIALTIES.map((s) => ({ url: `${B}/specialties/${s.slug}/` })),
    ...[...new Set(groups.map((g) => g.state))].map((s) => ({ url: `${B}/attorneys/${s}/` })),
    ...groups.map((g) => ({ url: B + cityPath(g.state, g.city) })),
    ...REAL_PROFILES.map((p) => ({ url: B + profilePath(p), ...(p.lastVerified ? { lastModified: new Date(p.lastVerified) } : {}) })),
  ];
}
