import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CookieBanner, Footer, Header } from '@/components/Chrome';
import './globals.css';

const jakarta = localFont({
  src: [
    { path: '../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = localFont({
  src: [
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const caveat = localFont({
  src: [
    { path: '../../node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://legalgrads.com'),
  verification: { google: 'VuaqBDBpMxICyqFhvuwk_BlT9Rvv19IfOCFuCcNZhGk' },
  title: { default: 'Legalgrads | Fresh out of law school. Ready to work for you.', template: '%s | Legalgrads' },
  description: 'A directory of newly licensed U.S. attorneys. Listings go live only after a manual check with the attorney’s state bar.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Legalgrads',
    description: 'Fresh out of law school. Ready to work for you.',
    url: 'https://legalgrads.com',
    siteName: 'Legalgrads',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legalgrads',
    description: 'Fresh out of law school. Ready to work for you.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased">
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
