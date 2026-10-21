import type { Metadata } from 'next';
import { OnboardingView } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Create your profile' };
export default function Page() { return <OnboardingView />; }
