import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicRecordIndex } from '@/components/PublicRecordIndex';
import { DirectoryView } from '@/views/DirectoryView';
export const metadata: Metadata = { title: 'Find an attorney', description: 'Search Claimed attorney profiles, or open Unclaimed public profiles from official licensing rosters by state and city.', alternates: { canonical: '/find-lawyer/' } };
export default function Page() {
  return (
    <>
      <Suspense fallback={null}><DirectoryView /></Suspense>
      <PublicRecordIndex />
    </>
  );
}
