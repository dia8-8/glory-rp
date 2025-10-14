export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JOBS, type JobKey } from '@/lib/jobs';

export async function GET(_: Request, { params }: { params: { job: string } }) {
  return NextResponse.json({ ok: true, job: params.job });
}

export async function POST(req: Request, { params }: { params: { job: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobKey = params.job as JobKey;
  const job = JOBS[jobKey];
  if (!job) return NextResponse.json({ error: 'Unknown job' }, { status: 404 });

  const payload = await req.json().catch(() => ({}));

  const missing = job.fields
    .filter((f: any) => f.required && f.name !== 'discord')
    .filter((f: any) => !payload[f.name] && payload[f.name] !== 0)
    .map((f: any) => f.name);
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });

  const webhook = process.env[job.webhookEnv] || process.env.DISCORD_APPLICATIONS_WEBHOOK;
  if (!webhook) return NextResponse.json({ error: 'Missing webhook env var' }, { status: 500 });

  // -------- build embed ----------
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const discordName = (session.user?.name as string) || 'Unknown';
  const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;

  const FALLBACK_ROLE_MAP: Partial<Record<JobKey, string>> = {
  police: process.env.DISCORD_ROLEID_POLICE,
  ems: process.env.DISCORD_ROLEID_EMS,
  justice: process.env.DISCORD_ROLEID_JUSTICE,
  mechanic: process.env.DISCORD_ROLEID_MECHANIC,
  };

  const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);
  const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  const { about, ...rest } = payload as Record<string, unknown>;

  const FIELD_VALUE_LIMIT = 1024;

  const wrapInlineCode = (v: unknown) => {
    const raw = String(v ?? '-').trim().replace(/`/g, '\\`');
    return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 2) + '```';
  };

  const wrapCodeBlock = (v: unknown) => {
    const raw = String(v ?? '-').trim().replace(/```/g, "'''");
    return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
  };

  const inlineFields = Object.entries(rest)
    .map(([k, v]) => ({
      name: trim(String(k || '').trim(), 256),
      value: wrapInlineCode(v),
      inline: true,
    }))
    .filter(f => f.name && f.value);

  const fields = [
    ...inlineFields.slice(0, 24),
    ...(about
      ? [{
          name: 'About',
          value: wrapCodeBlock(about),
          inline: false,
        }]
      : []),
  ].slice(0, 25);


  const embed: any = {
    title: trim(`New ${job.titleEn} application`, 256),
    color: 0x6c2de4,
    timestamp: new Date().toISOString(),
    fields,
    footer: { text: 'Glory RP | جلوري' },
  };

  embed.author = { name: trim(discordName, 256) };
  if (isHttpUrl(avatar)) embed.author.icon_url = avatar;
  const imgUrl = `https://i.imgur.com/qnax1g2.png`;
  if (isHttpUrl(imgUrl)) embed.image = { url: imgUrl };

  const body: any = {
    username: 'Jobs Applications', 
    avatar_url: `https://i.imgur.com/sHnaTv4.png`,
    embeds: [embed],
  };

  const roleId = (job as any).mentionRoleId ?? FALLBACK_ROLE_MAP[jobKey];

  if (roleId) {
    body.content = `<@&${roleId}>`;
    body.allowed_mentions = { parse: [], roles: [roleId] };
  }

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

