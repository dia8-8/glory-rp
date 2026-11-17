import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { getAccess } from '@/lib/server/discord';
import AdminNav from '@/components/admin/AdminNav';
import { ShieldAlert, LogIn } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Staff Dashboard', robots: { index: false } };

/** Every /admin page: staff (or admin) only, with the tab bar on top. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAr = getLang() === 'ar';
  const session = await getServerSession(authOptions);
  const access = await getAccess(session?.user?.id);

  if (!session || !access.staff) {
    return (
      <main className="page-shell flex items-center">
        <div className="card mx-auto my-32 max-w-md p-10 text-center">
          {session ? <ShieldAlert className="mx-auto h-10 w-10 text-red-300" /> : <LogIn className="mx-auto h-10 w-10 text-brand" />}
          <h1 className="mt-4 text-2xl font-extrabold">
            {session ? (isAr ? 'للإدارة فقط' : 'Staff only') : isAr ? 'سجّل الدخول' : 'Sign in'}
          </h1>
          <p className="mt-2 text-white/60">
            {session
              ? isAr ? 'هذه الصفحة متاحة لأعضاء الإدارة فقط.' : 'This page is only available to staff members.'
              : isAr ? 'سجّل الدخول بحساب الإدارة في الديسكورد.' : 'Sign in with your staff Discord account.'}
          </p>
          <Link href={session ? '/' : '/signin?callbackUrl=/admin'} className="btn btn-primary mt-6">
            {session ? (isAr ? 'الرئيسية' : 'Home') : isAr ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:pt-32">
        <AdminNav admin={access.admin} />
        {children}
      </div>
    </main>
  );
}
