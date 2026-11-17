// Route guard for admin-only APIs.
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdmin, isVipAdmin } from './discord';
import { db } from './db';

/** Returns { client, who } for a signed-in admin with Supabase configured, or a ready-to-send error response. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!(await isAdmin(id))) return { error: NextResponse.json({ error: 'Admins only' }, { status: 403 }) };
  const client = db();
  if (!client) return { error: NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 }) };
  return { client, who: session?.user?.name || id || 'admin' };
}

/** Same as requireAdmin, for the VIP store (VIP admins and admins). */
export async function requireVipAdmin() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!(await isVipAdmin(id))) return { error: NextResponse.json({ error: 'VIP admins only' }, { status: 403 }) };
  const client = db();
  if (!client) return { error: NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 }) };
  return { client, who: session?.user?.name || id || 'vip-admin' };
}

/** Turns a Supabase error into a friendly response ("run the SQL script" when a table is missing). */
export function dbError(message: string) {
  const missing = /does not exist|Could not find the table|schema cache|Bucket not found/i.test(message);
  return NextResponse.json(
    { error: missing ? 'setup-needed' : message },
    { status: missing ? 503 : 500 }
  );
}
