import type { Metadata } from 'next';
import { CookieSettingsView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Cookie settings' };
export default function Page() { return <CookieSettingsView />; }
