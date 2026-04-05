export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TICKETS, type TicketKey } from '@/lib/tickets';

export async function POST(req: Request, { params }: { params: { category: string } }) {
  try {
    // ✅ Authentication
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const categoryKey = params.category as TicketKey;
    const category = TICKETS[categoryKey];
    if (!category)
      return NextResponse.json({ error: 'Unknown ticket type' }, { status: 404 });

    const payload = await req.json().catch(() => ({}));

    // ✅ Check required fields
    const missing = category.fields
      .filter((f: any) => f.required && !payload[f.name])
      .map((f: any) => f.name);

    if (missing.length)
      return NextResponse.json(
        { error: `Missing required: ${missing.join(', ')}` },
        { status: 400 }
      );

    // ✅ Webhook setup
    const webhook = process.env[category.webhookEnv];
    if (!webhook)
      return NextResponse.json({ error: 'Missing webhook' }, { status: 500 });

    const mentionRoleId = category.mentionRoleId || null;

    // ✅ Discord user data
    const discordId = (session.user as any)?.id;
    const discordName = session.user?.name || 'Unknown';
    const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;
    const discordMention = discordId ? `<@${discordId}>` : discordName;

    // ✅ Color per ticket type
    const COLORS: Record<TicketKey, number> = {
      server: 0x5865f2, // blurple
      glitch: 0xffcc00, // yellow
      vip: 0xe67e22,    // orange
      player: 0xe74c3c, // red
    };

    const color = COLORS[categoryKey] ?? 0x9b59b6;

    // ✅ Safe trimming for Discord
    const FIELD_VALUE_LIMIT = 1024;
    const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);
    const wrapValue = (v: unknown) => {
      const raw = String(v ?? '-').trim().replace(/```/g, "'''");
      return '```' + trim(raw, FIELD_VALUE_LIMIT - 6) + '```';
    };

    // ✅ Create embed fields dynamically from submitted payload
    const embedFields = category.fields
      .map((f: any) => {
        const val = payload[f.name];
        if (val === undefined || val === null || val === '') return null;
        const isTextarea = f.type === 'textarea';
        return {
          name: f.labelEn,
          value: wrapValue(val),
          inline: !isTextarea,
        };
      })
      .filter(Boolean)
      .slice(0, 25); // Discord max 25 fields

    // ✅ Build embed
    const embed: any = {
      title: category.titleEn,
      color,
      timestamp: new Date().toISOString(),
      fields: embedFields,
      footer: { text: 'Glory RP | Tickets System' },
    };

    if (avatar && /^https?:\/\//i.test(avatar))
      embed.author = { name: discordName, icon_url: avatar };
    else embed.author = { name: discordName };

    embed.thumbnail = { url: 'https://i.imgur.com/sHnaTv4.png' };

    // ✅ Build message body
    const contentParts = [`**Submitted by:** ${discordMention}`];
    if (mentionRoleId) contentParts.push(`<@&${mentionRoleId}>`);

    const body = {
      username: `Ticket | ${category.titleEn}`,
      avatar_url: 'https://i.imgur.com/sHnaTv4.png',
      content: contentParts.join(' '),
      embeds: [embed],
      allowed_mentions: { parse: ['users', 'roles'] },
    };

    // ✅ Send to Discord
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Discord webhook failed:', text);
      return NextResponse.json(
        { error: `Webhook error: ${r.status}` },
        { status: r.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Ticket form error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
