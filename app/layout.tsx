import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/i18n-server';
import { Providers } from '@/lib/providers';
import BackToTop from '@/components/BackToTop';
import MobileTabBar from '@/components/MobileTabBar';
import { SITE } from '@/lib/site';
import SessionWrapper from '@/components/SessionWrapper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Analytics } from "@vercel/analytics/next"

const description =
  'Glory RP — a serious Arabic FiveM roleplay server. Careers, businesses, gangs and an active creator community. | جلوري — سيرفر رول بلاي عربي جاد على فايف إم.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Glory RP | جلوري', template: '%s | Glory RP' },
  description,
  applicationName: 'Glory RP',
  keywords: ['Glory RP', 'جلوري', 'FiveM', 'Arabic RP', 'رول بلاي', 'GTA V RP'],
  icons: { icon: [{ url: '/logo.png' }], apple: [{ url: '/logo.png' }] },
  openGraph: {
    title: 'Glory RP | جلوري',
    description,
    type: 'website',
    siteName: 'Glory RP',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Glory RP' }],
  },
  twitter: { card: 'summary_large_image', title: 'Glory RP | جلوري', description, images: ['/og.png'] },
};

export const viewport = { themeColor: '#12161c' };

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
            <div className="flex flex-1 flex-col">{children}</div>
            <BackToTop />
            <Footer />
            <MobileTabBar />
            <Analytics/>
          </Providers>
        </SessionWrapper>
      </body>
    </html>
  );
}
