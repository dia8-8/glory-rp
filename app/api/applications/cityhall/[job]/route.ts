export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CITYHALL, type CityhallKey } from '@/lib/cityhall';

export async function POST(req: Request, { params }: { params: { job: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const categoryKey = params.job as CityhallKey;
    const category = CITYHALL[categoryKey];
    if (!category) return NextResponse.json({ error: 'Unknown category' }, { status: 404 });

    const payload = await req.json().catch(() => ({}));

    // Validate required fields (ignore hidden ones)
    // Validate required fields (ignore hidden ones based on complaintType)
    const missing = category.fields
      .filter((f: any) => {
        if (!f.required) return false;

        // If complaint form — skip group fields that don't match
        if (categoryKey === 'complaint' && f.group) {
          if (payload.complaintType === 'government' && f.group !== 'government') return false;
          if (payload.complaintType === 'project' && f.group !== 'project') return false;
        }

        // Still required but missing value
        return !payload[f.name] && payload[f.name] !== 0;
      })
      .map((f: any) => f.name);


    if (missing.length) {
      return NextResponse.json({ error: `Missing required: ${missing.join(', ')}` }, { status: 400 });
    }

    // Webhook setup
    const webhook =
      process.env[category.webhookEnv] || process.env.DISCORD_CITYHALL_WEBHOOK;
    if (!webhook)
      return NextResponse.json({ error: 'Missing webhook env var' }, { status: 500 });

    const mentionRoleId = category.mentionRoleId || null;

    // --- Discord user info ---
    const discordId = (session.user as any)?.id;
    const discordName = (session.user?.name as string) || 'Unknown';
    const avatar = typeof session.user?.image === 'string' ? session.user.image : undefined;
    const discordMention = discordId ? `<@${discordId}>` : discordName;

    // --- Embed builder ---
    const FIELD_VALUE_LIMIT = 1024;
    const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);
    const wrapInlineCode = (v: unknown) => {
      const raw = String(v ?? '-').trim().replace(/```/g, "'''");
      return '```' + raw.slice(0, FIELD_VALUE_LIMIT - 6) + '```';
    };

    const inlineFields = category.fields
      .map((f: any) => {
        const val = payload[f.name];
        if (val === undefined || val === null || val === '') return null;

        const text = String(val).trim();
        const isTextarea = f.type === 'textarea';
        const isMultiline = text.includes('\n') || text.length > 150 || isTextarea;

        return {
          name: trim(f.labelEn || f.name, 256),
          value: wrapInlineCode(text),
          inline: !isMultiline, // ✅ textarea always false
        };
      })
      .filter(Boolean)
      .slice(0, 25);


    const embed: any = {
      title:
        categoryKey === 'business'
          ? 'New Business Application'
          : 'New Complaint Submission',
      color: categoryKey === 'business' ? 0x9b59b6 : 0xff5555,
      timestamp: new Date().toISOString(),
      fields: inlineFields.slice(0, 25),
      footer: { text: 'Glory RP | جلوري' },
    };

    embed.author = { name: trim(discordName, 256) };
    if (avatar && /^https?:\/\//i.test(avatar)) embed.author.icon_url = avatar;

    const imgUrl =
      categoryKey === 'business'
        ? 'https://i.imgur.com/qnax1g2.png'
        : 'https://i.imgur.com/qnax1g2.png';
    if (/^https?:\/\//i.test(imgUrl)) embed.image = { url: imgUrl };

    // --- Construct message body ---
    const contentParts = [`**Submitted by:** ${discordMention}`];
    if (mentionRoleId) contentParts.push(`<@&${mentionRoleId}>`);

    const body = {
      username:
        categoryKey === 'business'
          ? 'Cityhall | Business Applications'
          : 'Cityhall | Complaints',
      avatar_url:
        categoryKey === 'business'
          ? 'https://i.imgur.com/sHnaTv4.png'
          : 'https://i.imgur.com/sHnaTv4.png',
      embeds: [embed],
      content: contentParts.join(' '),
      allowed_mentions: { parse: ['users', 'roles'] },
    };

    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('Discord webhook failed:', text);
      return NextResponse.json({ error: `Webhook error: ${r.status}` }, { status: r.status });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Cityhall form error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
