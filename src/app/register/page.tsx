import type { Metadata } from 'next';
import { RegisterView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Create account' };
export default function Page() { return <RegisterView />; }
