import type { Metadata } from 'next';
import { HomeView } from '@/views/HomeView';

export const metadata: Metadata = { title: { absolute: 'Legalgrads | Fresh out of law school. Ready to work for you.' }, description: 'LegalGrads lists newly licensed attorneys with State Bar license details, so small businesses and individuals can contact them directly. No referral fees.', alternates: { canonical: '/' } };

export default function Page() {
  return <HomeView />;
}
