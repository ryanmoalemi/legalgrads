import { CookieBanner, Footer, Header } from '@/components/Chrome';
import { NotFoundView } from '@/views/MarketingViews';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main"><NotFoundView /></main>
      <Footer />
      <CookieBanner />
    </>
  );
}
