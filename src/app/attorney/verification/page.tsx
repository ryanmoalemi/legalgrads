import type { Metadata } from 'next';
import { AttorneyVerification } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Verification' };
export default function Page() { return <AttorneyVerification />; }
