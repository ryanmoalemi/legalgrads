import { CookieBanner, Footer, Header } from '@/components/Chrome';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
