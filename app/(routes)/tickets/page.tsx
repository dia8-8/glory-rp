import Link from 'next/link';
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

export default function TicketsIndexPage() {
  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <main className="relative w-full min-h-[100svh] bg-[#170930]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:pt-28 md:pt-32">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? 'تذاكر الدعم' : 'Support Tickets'}
          </h2>
          <p className="mt-3 text-base text-white/80">
            {isAr
              ? 'قدّم تذكرة دعم، بلّغ عن خلل، أو أرسل تقرير لاعب بسهولة.'
              : 'Submit a support ticket, report a glitch, or file a player report easily.'}
          </p>
        </div>

        {/* Ticket Cards */}
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 pt-8">
          {Object.values(TICKETS).map((ticket, i) => {
            const Icon = ICONS[ticket.slug] ?? Server;
            return (
              <Reveal key={ticket.slug} delay={i * 0.05}>
                <Link
                  href={`/tickets/${ticket.slug}`}
                  className="group card relative flex h-full flex-col items-center justify-start p-8 pt-12 text-center transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl ring-2 ring-white/20 shadow-xl"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
                      }}
                      aria-hidden
                    >
                      <Icon className="h-7 w-7 text-white/80" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold">
                    {isAr ? ticket.titleAr : ticket.titleEn}
                  </h3>
                  <p className="mt-3 text-sm text-white/70">
                    {isAr ? ticket.descAr : ticket.descEn}
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
