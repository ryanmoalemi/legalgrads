import type { Metadata } from 'next';
import { HomeView } from '@/views/HomeView';

export const metadata: Metadata = { title: 'Legalgrads | Fresh out of law school. Ready to work for you.' };

export default function Page() {
  return <HomeView />;
}
