import type { Metadata } from 'next';
import { ApplyView } from '@/views/ApplyView';
export const metadata: Metadata = { title: 'Join Legalgrads free', description: 'Newly licensed attorney? Join LegalGrads free. Create a verified profile with your bar number, practice areas and contact options.', alternates: { canonical: '/join/' } };
export default function Page() { return <ApplyView />; }
