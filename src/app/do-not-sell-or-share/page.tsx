import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
export const metadata: Metadata = { title: 'Do Not Sell or Share' };
export default function Page() { return <LegalArticle doc={DOCS['do-not-sell-or-share']} />; }
