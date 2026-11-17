import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, TABLE } from '@/lib/server/db';
import { isStaff } from '@/lib/server/discord';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'accepted', 'rejected', 'closed'];
const KINDS = ['interview', 'job', 'cityhall', 'ticket'];

/** GET ?status=pending&kind=interview&q=name → newest first, max 100 (staff only) */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!(await isStaff(session?.user?.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const client = db();
  if (!client) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const kind = url.searchParams.get('kind');
  const q = url.searchParams.get('q')?.trim();

  let query = client.from(TABLE).select('*').order('created_at', { ascending: false }).limit(100);
  if (status && STATUSES.includes(status)) query = query.eq('status', status);
  if (kind && KINDS.includes(kind)) query = query.eq('kind', kind);
  if (q) query = query.or(`discord_name.ilike.%${q.replace(/[%,()]/g, '')}%,discord_id.eq.${q.replace(/\D/g, '') || '0'}`);

  const [{ data, error }, counts] = await Promise.all([
    query,
    client.from(TABLE).select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  if (error) {
    const missing = /relation .* does not exist|Could not find the table/i.test(error.message);
    return NextResponse.json(
      { error: missing ? 'table-missing' : error.message },
      { status: missing ? 503 : 500 }
    );
  }
  return NextResponse.json({ items: data, pending: counts.count ?? 0 });
}
