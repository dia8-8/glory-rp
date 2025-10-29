import TicketForm from '@/components/TicketsForm';
import { TICKETS } from '@/lib/tickets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function TicketPage({ params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  const ticket = TICKETS[params.category as keyof typeof TICKETS];
  if (!ticket) return <div>404 - Ticket not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{ticket.titleEn}</h1>
      <p className="opacity-70">{ticket.descEn}</p>
      <TicketForm
        categoryKey={params.category as any}
        fields={ticket.fields}
        initialLang="en"
        discordName={session?.user?.name || 'Unknown'}
      />
    </div>
  );
}
