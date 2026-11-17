import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { t } from '@/lib/i18n';
import { TICKETS } from '@/lib/tickets';
import Reveal from '@/components/Reveal';
import { Bug, Users, Crown, Server } from 'lucide-react';

const ICONS: Record<string, any> = {
  server: Server,
  glitch: Bug,
  vip: Crown,
  player: Users,
};

export default async function TicketsIndexPage() {
  // 🔒 Require login
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin?callbackUrl=/tickets');

  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="section-title">
            {isAr ? 'تذاكر الدعم' : 'Support Tickets'}
          </h2>
          <p className="mt-3 text-base text-white/80">
            {isAr
              ? 'قدّم تذكرة دعم، بلّغ عن خلل، أو أرسل تقرير لاعب بسهولة.'
              : 'Submit a support ticket, report a glitch, or file a player report easily.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 pt-8">
          {Object.values(TICKETS).map((ticket, i) => {
            const Icon = ICONS[ticket.slug] ?? Server;
            return (
              <Reveal key={ticket.slug} delay={i * 0.05}>
                <Link
                  href={`/tickets/${ticket.slug}`}
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
                    {isAr ? ticket.titleAr : ticket.titleEn}
                  </h3>
                  <p className="mt-3 text-sm text-white/70">
                    {isAr ? ticket.descAr : ticket.descEn}
                  </p>
                  <span className="mt-6 btn btn-outline">
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
