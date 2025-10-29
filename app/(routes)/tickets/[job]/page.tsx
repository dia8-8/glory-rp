import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang, t } from '@/lib/i18n-server';
import { TICKETS, type TicketKey } from '@/lib/tickets';
import TicketForm from '@/components/TicketsForm';

export default async function TicketPage({ params }: { params: { category: string } }) {
  const ticketKey = params.category as TicketKey;
  const ticket = TICKETS[ticketKey];
  if (!ticket) return notFound();

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/signin?callbackUrl=/tickets/${ticketKey}`);

  const discordName = session.user?.name || '';
  const lang = getLang();
  const L = t(lang);
  const isAr = L.isAr;

  return (
    <div className="relative w-full min-h-[100svh] bg-[#170930]">
      <main className="mx-auto max-w-3xl px-4 pb-14 pt-24 sm:pt-28 md:pt-32">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
            {isAr ? ticket.titleAr : ticket.titleEn}
          </h1>
          <p className="mt-3 text-base text-white/80">
            {isAr ? ticket.descAr : ticket.descEn}
          </p>
        </div>

        {/* Ticket Form */}
        <TicketForm
          categoryKey={ticketKey}
          fields={ticket.fields}
          initialLang={lang}
          discordName={discordName}
        />
      </main>
    </div>
  );
}
