// app/api/interview/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function trim(s: unknown, n: number) {
  const x = String(s ?? '');
  return x.length > n ? x.slice(0, n) : x;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const webhook = process.env.DISCORD_INTERVIEW_WEBHOOK;
  if (!webhook) return NextResponse.json({ error: 'Missing DISCORD_INTERVIEW_WEBHOOK' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const required = ['age', 'timezone', 'hours', 'experience', 'about', 'mic', 'rulesOk'];
  const missing = required.filter(k => body[k] === undefined || body[k] === '' || body[k] === null);
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
  if (String(body.rulesOk) !== 'true' && body.rulesOk !== true) {
    return NextResponse.json({ error: 'You must accept the rules.' }, { status: 400 });
  }

  // Applicant identity
  const discordName =
    (session as any).discordUsername ||
    session.user?.name ||
    'Unknown';
  const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;

  const FIELD_VALUE_LIMIT = 1024;

  const wrapInlineCode = (input: unknown) => {
    const raw = String(input ?? '-').trim().replace(/```/g, "'''");
    return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
  };

  const wrapCodeBlock = (input: unknown) => {
    const raw = String(input ?? '-').trim().replace(/```/g, "'''");
    return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
  };

  const { about, ...rest } = body as Record<string, unknown>;

  const inlineFields = Object.entries(rest).map(([k, v]) => ({
    name: trim(k, 256),
    value: wrapInlineCode(v),
    inline: true,
  }));

  const fields = [
    ...inlineFields.slice(0, 24),
    ...(about ? [{ name: 'Story', value: wrapCodeBlock(about), inline: false }] : []),
  ].slice(0, 25);

  const embed: any = {
    title: 'New Join Interview',
    color: 0x6c2de4,
    timestamp: new Date().toISOString(),
    author: { name: trim(discordName, 256), ...(avatar ? { icon_url: avatar } : {}) },
    image: { url: `https://i.imgur.com/qnax1g2.png` },
    fields,
    footer: { text: 'Glory RP | جلوري' },
  };

  // Create Discord message payload
  const payload: any = {
    username: 'Interview Submissions',
    avatar_url: `https://i.imgur.com/sHnaTv4.png`,
    embeds: [embed],
  };

  // Add role + applicant mention
  const roleId = process.env.DISCORD_INTERVIEW_REVIEW_ROLE_ID;
  const discordUser = session.user?.name || session.user?.email || 'Unknown User';
  const discordId = (session.user as any)?.id;
  const discordMention = discordId ? `<@${discordId}>` : discordUser;

  if (roleId) {
    payload.content = `<@&${roleId}> — Applicant: ${discordMention}`;
    payload.allowed_mentions = { parse: ['users'], roles: [roleId] };
  } else {
    payload.content = `**Applicant:** ${discordMention}`;
    payload.allowed_mentions = { parse: ['users'] };
  }

  // Send webhook
  const r = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    return NextResponse.json({ error: `Webhook ${r.status}: ${text}` }, { status: r.status });
  }

  return NextResponse.json({ ok: true });
}
