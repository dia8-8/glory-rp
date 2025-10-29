export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TICKETS, type TicketKey } from '@/lib/tickets';

export async function POST(req: Request, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const categoryKey = params.category as TicketKey;
    const category = TICKETS[categoryKey];
    if (!category) return NextResponse.json({ error: 'Unknown ticket type' }, { status: 404 });

    const payload = await req.json().catch(() => ({}));

    const missing = category.fields
      .filter((f: any) => f.required && !payload[f.name])
      .map((f: any) => f.name);

    if (missing.length)
      return NextResponse.json({ error: `Missing required: ${missing.join(', ')}` }, { status: 400 });

    const webhook = process.env[category.webhookEnv];
    if (!webhook) return NextResponse.json({ error: 'Missing webhook' }, { status: 500 });

    const discordId = (session.user as any)?.id;
    const discordName = session.user?.name || 'Unknown';
    const avatar = session.user?.image;

    const embed = {
      title: category.titleEn,
      color: 0x9b59b6,
      timestamp: new Date().toISOString(),
      fields: category.fields.map((f: any) => ({
        name: f.labelEn,
        value: '```' + String(payload[f.name] || '-') + '```',
        inline: f.type !== 'textarea',
      })),
      footer: { text: 'Glory RP | Tickets' },
    };

    const body = {
      username: `Ticket | ${category.titleEn}`,
      avatar_url: 'https://i.imgur.com/sHnaTv4.png',
      embeds: [embed],
      content: `**Submitted by:** ${discordId ? `<@${discordId}>` : discordName} ${category.mentionRoleId ? `<@&${category.mentionRoleId}>` : ''}`,
      allowed_mentions: { parse: ['users', 'roles'] },
    };

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Ticket form error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
