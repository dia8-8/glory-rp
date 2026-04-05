export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JOBS, type JobKey } from '@/lib/jobs';

function trim(val: unknown, n: number) {
  const s = String(val ?? '');
  return s.length > n ? s.slice(0, n) : s;
}

function codeQuote(val: unknown) {
  const s = String(val ?? '-').replace(/`/g, 'ˋ');
  return '```' + s + '```';
}

export async function POST(req: Request, { params }: { params: { job: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobKey = params.job as JobKey;
    const job = JOBS[jobKey];
    if (!job) return NextResponse.json({ error: 'Unknown job' }, { status: 404 });

    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const missing = job.fields
      .filter((f: any) => f.required)
      .filter((f: any) => payload[f.name] === undefined || payload[f.name] === '')
      .map((f: any) => f.name);
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });
    }

    const webhook = process.env[job.webhookEnv] || process.env.DISCORD_APPLICATIONS_WEBHOOK;
    if (!webhook) return NextResponse.json({ error: 'Missing Discord webhook env var' }, { status: 500 });

    const { about, ...rest } = payload;
    const inlineFields = Object.entries(rest).map(([k, v]) => ({
      name: trim(k, 256),
      value: trim(codeQuote(v), 1024),
      inline: true,
    }));

    const fields = [
      ...inlineFields.slice(0, 24),
      ...(about
        ? [{ name: 'About', value: trim(about, 1024), inline: false }]
        : []),
    ].slice(0, 25);

    const embed: any = {
      title: trim(`New ${job.titleEn} application`, 256),
      color: 0x6c2de4,
      timestamp: new Date().toISOString(),
      fields,
      footer: { text: session.user?.email || session.user?.name || 'Applicant' },
    };

    const authorName = session.user?.name || 'Applicant';
    const authorIcon = typeof session.user?.image === 'string' ? session.user.image : undefined;
    embed.author = { name: trim(authorName, 256), ...(authorIcon ? { icon_url: authorIcon } : {}) };

    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: null, embeds: [embed] }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return NextResponse.json({ error: `Webhook ${r.status}: ${text}` }, { status: r.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('applications POST failed:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
