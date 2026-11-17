import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { isVipAdmin } from '@/lib/server/discord';
import StoreEditor from '@/components/admin/StoreEditor';
import { AdminsOnly } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

// Dashboard access is checked in admin/layout.tsx; the store needs the VIP Admin (or Admin) role.
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!(await isVipAdmin(session?.user?.id))) return <AdminsOnly isAr={getLang() === 'ar'} vip />;
  return <StoreEditor />;
}
