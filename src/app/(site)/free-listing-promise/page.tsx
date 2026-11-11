import type { Metadata } from 'next';
import { FreeListingPromiseView } from '@/views/FreeListingPromiseView';
export const metadata: Metadata = {
  title: 'Our free listing promise',
  description: 'Every attorney on LegalGrads gets a standard listing that is free for life. What is included, what we will never charge for, and how sponsored placements would be labeled.',
  alternates: { canonical: '/free-listing-promise/' },
};
export default function Page() { return <FreeListingPromiseView />; }
