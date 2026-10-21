import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
export const metadata: Metadata = { title: 'Terms of Service' };
export default function Page() { return <LegalArticle doc={DOCS['terms']} />; }
