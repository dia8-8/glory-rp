import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAccess } from '@/lib/server/discord';

export const dynamic = 'force-dynamic';

/** { staff, admin } — used to show the dashboard links in the user menu. */
export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json(await getAccess(session?.user?.id)); // { staff, admin }
}
