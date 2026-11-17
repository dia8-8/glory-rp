import { requireVipAdmin } from '@/lib/server/guard';
import { adminSnapshot } from '@/lib/server/storeAdmin';

export const dynamic = 'force-dynamic';

/** GET → products, bundles, sales, plus Tebex connection status and the list of Tebex packages */
export async function GET() {
  const g = await requireVipAdmin();
  if (g.error) return g.error;
  return adminSnapshot();
}
