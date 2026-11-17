import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { isAdmin } from '@/lib/server/discord';
import GalleryEditor from '@/components/admin/GalleryEditor';
import { AdminsOnly } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

// Staff access is checked in admin/layout.tsx; content editing needs the Admin role.
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin(session?.user?.id))) return <AdminsOnly isAr={getLang() === 'ar'} />;
  return <GalleryEditor />;
}
