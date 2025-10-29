import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang, t } from '@/lib/i18n-server';
import { JOBS, type JobKey } from '@/lib/jobs';
import JobApplyForm from '@/components/JobApplyForm';

export default async function JobApplyPage({ params }: { params: { job: string } }) {
  const jobKey = params.job as JobKey;
  const job = JOBS[jobKey];
  if (!job) return notFound();

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/signin?callbackUrl=/jobs/${jobKey}`);

  const discordName = session.user?.name || '';
  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <div className="relative w-full min-h-[100svh] bg-[#170930]">
      {/*
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: "url('/bg.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />
      */}

      <main className="mx-auto max-w-3xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? job.titleAr : job.titleEn}
          </h1>
          <p className="mt-3 text-base text-white/80">
            {isAr ? job.descAr : job.descEn}
          </p>
        </div>

        <JobApplyForm
          jobKey={jobKey}
          fields={job.fields}
          initialLang={lang}
          discordName={discordName}
          user={{ email: session.user?.email ?? '' }}
        />
      </main>
    </div>
  );
}
