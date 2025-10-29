import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { CITYHALL, type CityhallKey } from '@/lib/cityhall';
import CityHallForm from '@/components/CityHallForm';

export default async function CityhallPage({
  params,
}: {
  params: { job: string };
}) {
  const categoryKey = params.job as CityhallKey;
  const category = CITYHALL[categoryKey];

  if (!category) return notFound();

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/signin?callbackUrl=/cityhall/${categoryKey}`);

  const discordName = session.user?.name || '';
  const lang = getLang();
  const isAr = lang === 'ar';

  return (
    <div className="relative w-full min-h-[100svh] bg-[#170930]">
      <main className="mx-auto max-w-3xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? category.titleAr : category.titleEn}
          </h1>
          <p className="mt-3 text-base text-white/80">
            {isAr ? category.descAr : category.descEn}
          </p>
        </div>

        <CityHallForm
          categoryKey={categoryKey}
          fields={category.fields}
          initialLang={lang}
          discordName={discordName}
          user={{ email: session.user?.email ?? '' }}
        />
      </main>
    </div>
  );
}
