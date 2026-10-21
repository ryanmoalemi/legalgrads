import type { Metadata } from 'next';
import { CookieSettingsView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Cookie settings' };
export default function Page() { return <CookieSettingsView />; }
