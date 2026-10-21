import type { Metadata } from 'next';
import { ClientAppointments } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Appointments' };
export default function Page() { return <ClientAppointments />; }
