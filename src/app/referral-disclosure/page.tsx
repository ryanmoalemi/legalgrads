import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
export const metadata: Metadata = { title: 'Referral Disclosure' };
export default function Page() { return <LegalArticle doc={DOCS['referral-disclosure']} />; }
