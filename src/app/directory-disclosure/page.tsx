import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['directory-disclosure'];
export const metadata: Metadata = { title: doc.title, description: 'What the LegalGrads directory is and is not: not a law firm or referral service, no rankings, no share of attorney fees.', alternates: { canonical: '/directory-disclosure/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
