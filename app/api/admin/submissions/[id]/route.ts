import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, TABLE, type Submission, type SubmissionStatus } from '@/lib/server/db';
import { isStaff, addRole, removeRole, sendDM } from '@/lib/server/discord';
import { JOBS } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

const ALLOWED: SubmissionStatus[] = ['pending', 'accepted', 'rejected', 'closed'];

function dmText(s: Submission, status: SubmissionStatus, note?: string) {
  const reason = note ? `\n\n📝 ${note}` : '';
  const site = process.env.NEXT_PUBLIC_SITE_URL ? `\n${process.env.NEXT_PUBLIC_SITE_URL}/status` : '';
  if (s.kind === 'interview') {
    return status === 'accepted'
      ? `✅ **Glory RP** — Your join interview was **accepted**! Welcome to the city.\n✅ تم **قبول** مقابلة الانضمام الخاصة بك! مرحبًا بك في جلوري.${reason}${site}`
      : `❌ **Glory RP** — Your join interview was **not accepted**.\n❌ لم يتم قبول مقابلة الانضمام الخاصة بك.${reason}`;
  }
  if (s.kind === 'job') {
    const job = (JOBS as Record<string, any>)[s.category];
    const name = job ? `${job.titleEn} / ${job.titleAr}` : s.category;
    return status === 'accepted'
      ? `✅ **Glory RP** — Your **${name}** application was **accepted**! Staff will contact you with next steps.\n✅ تم قبول طلبك.${reason}`
      : `❌ **Glory RP** — Your **${name}** application was **not accepted**.\n❌ لم يتم قبول طلبك.${reason}`;
  }
  return `📬 **Glory RP** — Your ${s.kind === 'ticket' ? 'ticket' : 'request'} (${s.category}) was **${status}**.\n📬 تم تحديث طلبك.${reason}`;
}

/** PATCH { status, note?, notify? } — staff only. Applies Discord roles for interviews and DMs the player. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const staffId = session?.user?.id;
  if (!(await isStaff(staffId))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const client = db();
  if (!client) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const status = body.status as SubmissionStatus;
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';
  const notify = body.notify !== false;
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: 'Bad status' }, { status: 400 });

  const { data: current, error: readErr } = await client.from(TABLE).select('*').eq('id', params.id).single();
  if (readErr || !current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const sub = current as Submission;

  const { data: updated, error } = await client
    .from(TABLE)
    .update({
      status,
      note: note || null,
      reviewed_by: session?.user?.name || staffId,
      reviewed_at: status === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', params.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Discord side effects
  const result = { roles: null as null | boolean, dm: null as null | boolean };
  if (sub.kind === 'interview' && (status === 'accepted' || status === 'rejected')) {
    const whitelist = process.env.DISCORD_ROLE_WHITELIST;
    const rejected = process.env.DISCORD_ROLE_REJECTED;
    result.roles =
      status === 'accepted'
        ? (await addRole(sub.discord_id, whitelist)) && (await removeRole(sub.discord_id, rejected).then(() => true))
        : await addRole(sub.discord_id, rejected);
  }
  if (notify && status !== 'pending') result.dm = await sendDM(sub.discord_id, dmText(sub, status, note));

  return NextResponse.json({ item: updated, ...result });
}
