import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/i18n-server';
import { Providers } from '@/lib/providers';
import BackToTop from '@/components/BackToTop';
import SessionWrapper from '@/components/SessionWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Glory RP | جلوري',
  description: 'Serious RP • FiveM • Arabic/English • Glory RP',
  icons: { icon: [{ url: '/logo.png' }] },
  openGraph: {
    title: 'Glory RP | جلوري',
    description: 'Serious RP • FiveM • Arabic/English',
    type: 'website',
    images: ['/bg.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/bg.png'] },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getLang();
  const session = await getServerSession(authOptions);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <Script src="http://localhost:8097" strategy="beforeInteractive" />
        )}
      </head>
      <body className="min-h-dvh flex flex-col text-white antialiased">
        <SessionWrapper session={session}>
          <Providers initialLang={lang}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <BackToTop />
            <Footer />
          </Providers>
        </SessionWrapper>
      </body>
    </html>
  );
}
