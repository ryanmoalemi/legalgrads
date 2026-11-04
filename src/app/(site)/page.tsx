import type { Metadata } from 'next';
import { HomeView } from '@/views/HomeView';

export const metadata: Metadata = {
  title: { absolute: 'LegalGrads | Fresh out of law school. Ready to work for you.' },
  description: 'LegalGrads lists newly licensed attorneys with State Bar license details, so small businesses and individuals can contact them directly. No referral fees.',
  alternates: { canonical: '/' },
  openGraph: { title: 'LegalGrads | Fresh out of law school. Ready to work for you.', siteName: 'LegalGrads', url: '/' },
};

export default function Page() {
  return <HomeView />;
}
