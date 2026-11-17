import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { BRAND } from '@/lib/brand';
import { CheckCircle2, XCircle, Clock, LogIn, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Application' };

type State = 'accepted' | 'rejected' | 'pending' | 'error';

/** Reads the applicant's Discord roles (same roles the interview form already uses). */
async function getState(discordId: string): Promise<State> {
  const { DISCORD_GUILD_ID, DISCORD_BOT_TOKEN, DISCORD_ROLE_WHITELIST, DISCORD_ROLE_REJECTED } = process.env;
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) return 'error';
  try {
    const r = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      cache: 'no-store',
    });
    if (!r.ok) return 'error';
    const roles: string[] = (await r.json()).roles ?? [];
    if (DISCORD_ROLE_WHITELIST && roles.includes(DISCORD_ROLE_WHITELIST)) return 'accepted';
    if (DISCORD_ROLE_REJECTED && roles.includes(DISCORD_ROLE_REJECTED)) return 'rejected';
    return 'pending';
  } catch {
    return 'error';
  }
}

export default async function StatusPage() {
  const isAr = getLang() === 'ar';
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  const state = id ? await getState(id) : null;

  const steps = [
    { en: 'Sign in with Discord', ar: 'تسجيل الدخول بالديسكورد' },
    { en: 'Submit the join interview', ar: 'إرسال مقابلة الانضمام' },
    { en: 'Staff review', ar: 'مراجعة الإدارة' },
    { en: 'Decision', ar: 'القرار' },
  ];
  const reached = !session ? 0 : state === 'pending' ? 2 : state === 'error' ? 1 : 4;

  const view = {
    accepted: {
      Icon: CheckCircle2,
      tone: 'text-brand bg-brand/10 ring-brand/30',
      title: isAr ? 'تم قبولك! 🎉' : 'You’re accepted! 🎉',
      body: isAr ? 'مرحبًا بك في جلوري. تفقّد الديسكورد لمعرفة الخطوات القادمة.' : 'Welcome to Glory RP. Check Discord for your next steps.',
    },
    rejected: {
      Icon: XCircle,
      tone: 'text-red-300 bg-red-400/10 ring-red-400/30',
      title: isAr ? 'لم يتم قبول طلبك' : 'Your application wasn’t accepted',
      body: isAr ? 'للاستفسار، افتح تذكرة في الديسكورد.' : 'If you have questions, open a ticket on Discord.',
    },
    pending: {
      Icon: Clock,
      tone: 'text-amber-300 bg-amber-400/10 ring-amber-400/30',
      title: isAr ? 'لا يوجد قرار بعد' : 'No decision yet',
      body: isAr
        ? 'إذا أرسلت المقابلة فهي قيد المراجعة. إذا لم ترسلها بعد، يمكنك التقديم الآن.'
        : 'If you sent the interview, it’s being reviewed. If you haven’t applied yet, you can do it now.',
    },
    error: {
      Icon: Clock,
      tone: 'text-white/70 bg-white/5 ring-white/15',
      title: isAr ? 'تعذر التحقق الآن' : 'Couldn’t check right now',
      body: isAr ? 'حاول مرة أخرى لاحقًا، أو تأكد أنك عضو في سيرفر الديسكورد.' : 'Try again later, and make sure you’re a member of our Discord server.',
    },
  } as const;

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-2xl px-4 pb-24 pt-28 md:pt-36">
        <div className="mb-10 text-center">
          <h1 className="section-title">{isAr ? 'حالة طلبي' : 'My Application'}</h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" />
        </div>

        {/* Progress */}
        <ol className="mb-8 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s.en} className="text-center">
              <div className={`h-1.5 rounded-full ${i < reached ? 'bg-brand' : 'bg-white/10'}`} />
              <span className={`mt-2 block text-[11px] sm:text-xs ${i < reached ? 'text-white/80' : 'text-white/35'}`}>
                {isAr ? s.ar : s.en}
              </span>
            </li>
          ))}
        </ol>

        <div className="card p-8 text-center sm:p-10">
          {!session ? (
            <>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/15">
                <LogIn className="h-8 w-8 text-white/70" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold">{isAr ? 'سجّل الدخول أولًا' : 'Sign in first'}</h2>
              <p className="mt-2 text-white/65">
                {isAr ? 'سجّل الدخول بالديسكورد لرؤية حالة طلبك.' : 'Sign in with Discord to see your application status.'}
              </p>
              <Link href="/signin?callbackUrl=/status" className="btn btn-primary mt-6">
                {isAr ? 'تسجيل الدخول' : 'Sign in'}
              </Link>
            </>
          ) : (
            (() => {
              const v = view[state!];
              return (
                <>
                  <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ring-1 ${v.tone}`}>
                    <v.Icon className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 text-2xl font-extrabold">{v.title}</h2>
                  <p className="mt-2 text-white/65">{v.body}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {state === 'pending' && (
                      <Link href="/apply" className="btn btn-primary">
                        {isAr ? 'قدّم الآن' : 'Apply now'}
                      </Link>
                    )}
                    <a href={BRAND.discord} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      Discord <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </>
              );
            })()
          )}
        </div>
      </section>
    </main>
  );
}
