import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLang } from '@/lib/i18n-server';
import { isStaff } from '@/lib/server/discord';
import { db } from '@/lib/server/db';
import { JOBS } from '@/lib/jobs';
import { TICKETS } from '@/lib/tickets';
import { CITYHALL } from '@/lib/cityhall';
import AdminDashboard, { type Labels } from '@/components/admin/AdminDashboard';
import { ShieldAlert, LogIn } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Staff Dashboard', robots: { index: false } };

/** Field labels so answers show readable questions instead of raw keys. */
function buildLabels(): Labels {
  const fields: Labels['fields'] = {
    name: { en: 'Character name', ar: 'اسم الشخصية' },
    age: { en: 'Age', ar: 'العمر' },
    timezone: { en: 'Timezone', ar: 'المنطقة الزمنية' },
    hours: { en: 'Hours per week', ar: 'ساعات اللعب أسبوعيًا' },
    mic: { en: 'Microphone', ar: 'مايكروفون' },
    experience: { en: 'RP experience', ar: 'خبرة الرول بلاي' },
    steam: { en: 'Steam link', ar: 'رابط Steam' },
    about: { en: 'Character story', ar: 'قصة الشخصية' },
    rulesOk: { en: 'Accepted rules', ar: 'وافق على القوانين' },
  };
  const categories: Labels['categories'] = { interview: { en: 'Join interview', ar: 'مقابلة الانضمام' } };
  const add = (key: string, obj: any) => {
    categories[key] = { en: obj.titleEn ?? key, ar: obj.titleAr ?? key };
    for (const f of obj.fields ?? []) fields[f.name] ??= { en: f.labelEn ?? f.name, ar: f.labelAr ?? f.name };
  };
  Object.entries(JOBS).forEach(([k, v]) => add(k, v));
  Object.entries(TICKETS).forEach(([k, v]) => add(k, v));
  Object.entries(CITYHALL).forEach(([k, v]) => add(k, v));
  return { fields, categories };
}

export default async function AdminPage() {
  const isAr = getLang() === 'ar';
  const session = await getServerSession(authOptions);
  const staff = await isStaff(session?.user?.id);

  if (!session || !staff) {
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
        <AdminDashboard labels={buildLabels()} configured={!!db()} />
      </div>
    </main>
  );
}
