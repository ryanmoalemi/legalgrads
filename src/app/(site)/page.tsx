import type { Metadata } from 'next';
import { HomeView, type HomeState } from '@/views/HomeView';
import { cityGroups, cityListLabel } from '@/lib/profiles';

export const metadata: Metadata = {
  title: { absolute: 'LegalGrads | Fresh out of law school. Ready to work for you.' },
  description: 'LegalGrads lists newly licensed attorneys with State Bar license details, so small businesses and individuals can contact them directly. No referral fees.',
  alternates: { canonical: '/' },
  openGraph: { title: 'LegalGrads | Fresh out of law school. Ready to work for you.', siteName: 'LegalGrads', url: '/' },
};

/** Licensing states that have profiles, with their largest in-state office cities for the hero search. */
function homeStates(): HomeState[] {
  const byState = new Map<string, HomeState>();
  for (const g of cityGroups()) {
    const item = byState.get(g.stateCode) ?? { code: g.stateCode, name: g.stateName, cities: [] };
    if (g.kind === 'L') item.cities.push(cityListLabel(g));
    byState.set(g.stateCode, item);
  }
  // cityGroups() is ordered by size, so the first cities are the biggest.
  return [...byState.values()].map((s) => ({ ...s, cities: s.cities.slice(0, 15) })).sort((a, b) => a.name.localeCompare(b.name));
}

export default function Page() {
  return <HomeView states={homeStates()} />;
}
