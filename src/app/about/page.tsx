import type { Metadata } from 'next';
import { AboutView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'About', description: 'LegalGrads is a free directory of newly licensed attorneys, built to connect recent law graduates with clients who need affordable help.', alternates: { canonical: '/about/' } };
export default function Page() { return <AboutView />; }
