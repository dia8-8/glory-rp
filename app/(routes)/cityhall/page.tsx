import Link from 'next/link';
import { getLang } from '@/lib/i18n-server';
import { t } from '@/lib/i18n';
import { CITYHALL } from '@/lib/cityhall';
import Reveal from '@/components/Reveal';
import { Building2, FileText } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

const ICONS: Record<string, any> = {
  business: Building2,
  complaint: FileText,
};

export default async function CityhallIndexPage() {
    // 🔒 Require login before showing the page
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin?callbackUrl=/cityhall');

  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <main className="relative w-full min-h-[100svh] bg-[#170930]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? 'البلدية' : 'City Hall'}
          </h2>
          <p className="mt-3 text-base text-white/80">
            {isAr ? 'قدّم شكوى أو طلب عمل تجاري بسهولة.' : 'Submit a complaint or apply for a business with ease.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 pt-8">
          {Object.values(CITYHALL).map((category, i) => {
            const Icon = ICONS[category.slug] ?? Building2;
            return (
              <Reveal key={category.slug} delay={i * 0.05}>
                <Link
                  href={`/cityhall/${category.slug}`}
                  className="group card relative flex h-full flex-col items-center justify-start p-8 pt-12 text-center transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
                      style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
                      aria-hidden
                    >
                      <Icon className="h-7 w-7 text-white/80" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    {isAr ? category.titleAr : category.titleEn}
                  </h3>
                  <p className="mt-3 text-sm text-white/70">
                    {isAr ? category.descAr : category.descEn}
                  </p>
                  <span className="mt-6 inline-block btn btn-ghost cursor-pointer">
                    {isAr ? 'فتح النموذج' : 'Open Form'}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}
