// app/api/interview/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { protectAndRecord } from '@/lib/server/submissions';
import { cookies } from 'next/headers';
import { hasPassed, PASS_COOKIE } from '@/lib/server/quiz';
import { DEFAULT_INTERVIEW_FIELDS } from '@/lib/interview';

function trim(s: unknown, n: number) {
  const x = String(s ?? '');
  return x.length > n ? x.slice(0, n) : x;
}

async function getDiscordMember(discordId: string) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!res.ok) return null;
  return res.json();
}



export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const discordId = (session.user as any)?.id;

  if (!discordId) {
    return NextResponse.json({ error: 'Discord ID missing' }, { status: 400 });
  }

  const member = await getDiscordMember(discordId);

  if (!member) {
    return NextResponse.json({ error: 'User not found in Discord server' }, { status: 403 });
  }

  const userRoles: string[] = member.roles || [];

  // Already whitelisted, or marked under 18 → can't apply
  const { DISCORD_ROLE_WHITELIST, DISCORD_ROLE_UNDER18 } = process.env;
  if (DISCORD_ROLE_WHITELIST && userRoles.includes(DISCORD_ROLE_WHITELIST)) {
    return NextResponse.json(
      { error: 'You are already whitelisted. / أنت مقبول بالفعل في السيرفر.' },
      { status: 403 }
    );
  }
  if (DISCORD_ROLE_UNDER18 && userRoles.includes(DISCORD_ROLE_UNDER18)) {
    return NextResponse.json(
      { error: 'You must be 18 or older to join. / يجب أن يكون عمرك 18 سنة أو أكثر للانضمام.' },
      { status: 403 }
    );
  }

  const webhook = process.env.DISCORD_INTERVIEW_WEBHOOK;
  if (!webhook) return NextResponse.json({ error: 'Missing DISCORD_INTERVIEW_WEBHOOK' }, { status: 500 });

  const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Only answers to the interview questions are kept.
  const questions = DEFAULT_INTERVIEW_FIELDS;
  const body: Record<string, unknown> = { rulesOk: raw.rulesOk };
  for (const q of questions) body[q.name] = typeof raw[q.name] === 'string' ? (raw[q.name] as string).trim().slice(0, 4000) : raw[q.name];

  const missing = questions
    .filter((q) => q.required !== false && (body[q.name] === undefined || body[q.name] === '' || body[q.name] === null))
    .map((q) => q.labelEn);
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
  if (String(raw.rulesOk) !== 'true' && raw.rulesOk !== true) {
    return NextResponse.json({ error: 'You must accept the rules.' }, { status: 400 });
  }

  // Must have passed the rules quiz (signed cookie set by /api/quiz)
  if (!hasPassed(cookies().get(PASS_COOKIE)?.value, discordId)) {
    return NextResponse.json(
      { error: 'Please pass the rules quiz first. / يرجى اجتياز اختبار القوانين أولًا.' },
      { status: 403 }
    );
  }

  // Spam protection + save for the staff dashboard
  const blocked = await protectAndRecord(session, 'interview', 'interview', body);
  if (blocked) return blocked;

  // Applicant identity
  const discordName =
    (session as any).discordUsername ||
    session.user?.name ||
    'Unknown';
  const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;

  const FIELD_VALUE_LIMIT = 1024;

  const wrap = (input: unknown) => {
    const text = String(input ?? '-').trim().replace(/```/g, "'''") || '-';
    return '```' + text.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
  };

  // One embed field per question, labelled with the English question; long answers take a full row
  const shown = (q: (typeof questions)[number]) => {
    const v = body[q.name];
    if (q.type === 'select') return q.options.find((o) => o.value === v)?.labelEn ?? v;
    return v;
  };
  const fields = [
    ...questions.filter((q) => q.type !== 'textarea').map((q) => ({ name: trim(q.labelEn, 256), value: wrap(shown(q)), inline: true })),
    ...questions.filter((q) => q.type === 'textarea').map((q) => ({ name: trim(q.labelEn, 256), value: wrap(shown(q)), inline: false })),
  ].slice(0, 25);

  const embed: any = {
    title: 'New Join Interview',
    color: 0x50f018,
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
  //const discordId = (session.user as any)?.id;
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
