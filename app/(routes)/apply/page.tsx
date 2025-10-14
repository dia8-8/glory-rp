import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang, t } from '@/lib/i18n-server';
import ApplyForm from '@/components/ApplyForm';
import Link from 'next/link';

export default async function ApplyPage() {
  const session = await getServerSession(authOptions);
  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  const discordName =
    (session as any)?.discordUsername ||
    session?.user?.name ||
    '';

  if (!session) {
    return (
      <main
        className="relative min-h-[100dvh]"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 -z-10 bg-black/50" />
        <section className="mx-auto flex min-h-[100dvh] w-full max-w-xl items-center justify-center px-4 text-center bg-[#170930]">
          <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur">
            <h1 className="text-3xl font-extrabold">
              {isAr ? 'انضم إلينا' : 'Join us'}
            </h1>
            <p className="mt-2 text-white/80">
              {isAr
                ? 'سجّل دخولك عبر ديسكورد لإكمال المقابلة.'
                : 'Sign in with Discord to complete the interview.'}
            </p>
            <Link
              href="/signin?callbackUrl=/apply"
              className="mt-6 inline-flex items-center gap-2 btn btn-primary"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-[100dvh] bg-[#170930]"
    >
      <div className="absolute inset-0 -z-10 bg-black/50" />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32 ">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? 'مقابلة الانضمام' : 'Join Interview'}
          </h1>
          <p className="mt-3 text-base text-white/80">
            {isAr
              ? ' أجب على الأسئلة التالية للتقديم على الانضمام للسيرفر للمقابلة.'
              : 'Answer the questions below to apply to join the server for an interview.'}
          </p>
        </div>
        <ApplyForm
          initialLang={lang}
          discordName={discordName}
        />
      </section>
    </main>
  );
}
