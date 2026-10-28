import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['cookies'];
export const metadata: Metadata = { title: doc.title, description: 'Which cookies legalgrads.com uses, why we use them, and how to change your choices at any time.', alternates: { canonical: '/cookies/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
