export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CITYHALL, type CityhallKey } from '@/lib/cityhall';

export async function GET(_: Request, { params }: { params: { category: string } }) {
  return NextResponse.json({ ok: true, category: params.category });
}

export async function POST(req: Request, { params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const categoryKey = params.category as CityhallKey;
  const category = CITYHALL[categoryKey];
  if (!category) return NextResponse.json({ error: 'Unknown category' }, { status: 404 });

  const payload = await req.json().catch(() => ({}));

  const missing = category.fields
    .filter((f: any) => f.required)
    .filter((f: any) => !payload[f.name] && payload[f.name] !== 0)
    .map((f: any) => f.name);

  if (missing.length) {
    return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
  }

  // Default webhook fallback
  const webhook =
    (category as any).webhookEnv && process.env[(category as any).webhookEnv]
      ? process.env[(category as any).webhookEnv]
      : process.env.DISCORD_CITYHALL_WEBHOOK;

  if (!webhook) return NextResponse.json({ error: 'Missing webhook env var' }, { status: 500 });

  // ------------- Build embed ----------------
  const discordName = (session.user?.name as string) || 'Unknown';
  const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;

  const FIELD_VALUE_LIMIT = 1024;
  const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);
  const wrapInlineCode = (v: unknown) => {
    const raw = String(v ?? '-').trim().replace(/```/g, "'''");
    return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
  };

  const inlineFields = Object.entries(payload)
    .map(([k, v]) => ({
      name: trim(String(k || '').trim(), 256),
      value: wrapInlineCode(v),
      inline: false,
    }))
    .filter(f => f.name && f.value);

  const embed: any = {
    title:
      categoryKey === 'business'
        ? '🏢 New Business Application'
        : '🧾 New Complaint Submission',
    color: categoryKey === 'business' ? 0x00bcd4 : 0xff5555,
    timestamp: new Date().toISOString(),
    fields: inlineFields.slice(0, 25),
    footer: { text: 'Glory RP | جلوري' },
  };

  embed.author = { name: trim(discordName, 256) };
  if (avatar && /^https?:\/\//i.test(avatar)) embed.author.icon_url = avatar;

  const imgUrl =
    categoryKey === 'business'
      ? 'https://i.imgur.com/dyHrcbz.png'
      : 'https://i.imgur.com/xTnAULR.png';
  if (/^https?:\/\//i.test(imgUrl)) embed.image = { url: imgUrl };

  // ------------- Mention setup -------------
  const discordId = (session.user as any)?.id;
  const discordUser = session.user?.name || session.user?.email || 'Unknown User';
  const discordMention = discordId ? `<@${discordId}>` : discordUser;

  const body: any = {
    username:
      categoryKey === 'business' ? 'Cityhall | Business Applications' : 'Cityhall | Complaints',
    avatar_url: categoryKey === 'business'
      ? 'https://i.imgur.com/2qeh7U6.png'
      : 'https://i.imgur.com/Wzi1YhN.png',
    embeds: [embed],
    content: `**Submitted by:** ${discordMention}`,
    allowed_mentions: { parse: ['users'] },
  };

  const r = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    return NextResponse.json({ error: `Webhook ${r.status}: ${text}` }, { status: r.status });
  }

  return NextResponse.json({ ok: true });
}
