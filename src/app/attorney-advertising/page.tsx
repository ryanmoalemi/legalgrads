import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
export const metadata: Metadata = { title: 'Attorney Advertising' };
export default function Page() { return <LegalArticle doc={DOCS['attorney-advertising']} />; }
