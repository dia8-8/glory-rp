import Link from 'next/link';
import { getLang } from '@/lib/i18n-server';
import { t } from '@/lib/i18n';
import { JOBS } from '@/lib/jobs';
import Reveal from '@/components/Reveal';
import { Shield, Ambulance, Scale, Wrench } from 'lucide-react';

const ICONS: Record<string, any> = {
  police: Shield,
  ems: Ambulance,
  justice: Scale,
  mechanic: Wrench,
};

export default function JobsIndexPage() {
  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="section-title">
            {isAr ? 'التوظيف' : 'Jobs'}
          </h2>
          <p className="mt-3 text-base text-white/80">
            {isAr ? 'اختر القسم لملء النموذج المناسب.' : 'Choose a department to fill the specific form.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 md:grid-cols-2 pt-8">
          {Object.values(JOBS).map((job, i) => {
            const Icon = ICONS[job.slug] ?? Shield;
            return (
              <Reveal key={job.slug} delay={i * 0.05}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className="group card relative flex h-full flex-col items-center justify-start p-8 pt-12 text-center card-hover"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                    <div
                      className="icon-tile transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                      aria-hidden
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    {isAr ? job.titleAr : job.titleEn}
                  </h3>
                  <p className="mt-3 text-sm text-white/70">
                    {isAr ? job.descAr : job.descEn}
                  </p>
                  <span className="mt-6 btn btn-outline">
                    {isAr ? 'التقديم' : 'Apply'}
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
