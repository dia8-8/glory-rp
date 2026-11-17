import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { NOTIFY_TABLE } from '@/lib/server/notify';

export const dynamic = 'force-dynamic';

/** GET → the signed-in player's 30 latest notifications + unread count */
export async function GET() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = db();
  if (!client) return NextResponse.json({ items: [], unread: 0 });

  const [list, unread] = await Promise.all([
    client.from(NOTIFY_TABLE).select('*').eq('discord_id', id).order('created_at', { ascending: false }).limit(30),
    client.from(NOTIFY_TABLE).select('id', { count: 'exact', head: true }).eq('discord_id', id).is('read_at', null),
  ]);
  // Table not created yet → behave as "no notifications" instead of erroring
  if (list.error) return NextResponse.json({ items: [], unread: 0 });
  return NextResponse.json({ items: list.data, unread: unread.count ?? 0 });
}

/** POST { ids?: string[] } → mark those (or all) as read. Only touches the player's own rows. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = db();
  if (!client) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string').slice(0, 100) : [];

  let q = client.from(NOTIFY_TABLE).update({ read_at: new Date().toISOString() }).eq('discord_id', id).is('read_at', null);
  if (ids.length) q = q.in('id', ids);
  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
