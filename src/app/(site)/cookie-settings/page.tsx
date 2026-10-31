import type { Metadata } from 'next';
import { CookieSettingsView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Cookie settings', description: 'Choose which optional cookies and analytics LegalGrads may use. Essential site functions work without them.', alternates: { canonical: '/cookie-settings/' } };
export default function Page() { return <CookieSettingsView />; }
