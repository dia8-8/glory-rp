import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isStaff } from '@/lib/server/discord';

export const dynamic = 'force-dynamic';

/** { staff: boolean } — used to show the dashboard link in the user menu. */
export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({ staff: await isStaff(session?.user?.id) });
}
