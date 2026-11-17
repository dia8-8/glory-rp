import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAccess } from '@/lib/server/discord';
import { db } from '@/lib/server/db';
import { DEFAULT_INTERVIEW_FIELDS } from '@/lib/interview';
import { JOBS } from '@/lib/jobs';
import { TICKETS } from '@/lib/tickets';
import { CITYHALL } from '@/lib/cityhall';
import AdminDashboard, { type Labels } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

/** Field labels so answers show readable questions instead of raw keys. */
async function buildLabels(): Promise<Labels> {
  const fields: Labels['fields'] = { rulesOk: { en: 'Accepted rules', ar: 'وافق على القوانين' } };
  const categories: Labels['categories'] = { interview: { en: 'Join interview', ar: 'مقابلة الانضمام' } };
  const addFields = (list: any[]) => {
    for (const f of list ?? []) fields[f.name] ??= { en: f.labelEn ?? f.name, ar: f.labelAr ?? f.name };
  };
  addFields(DEFAULT_INTERVIEW_FIELDS);
  for (const src of [JOBS, TICKETS, CITYHALL] as Record<string, any>[]) {
    for (const [k, v] of Object.entries(src)) {
      categories[k] = { en: v.titleEn ?? k, ar: v.titleAr ?? k };
      addFields(v.fields);
    }
  }
  return { fields, categories };
}

// Access is checked in admin/layout.tsx; VIP admins who aren't staff go straight to the store.
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const access = await getAccess(session?.user?.id);
  if (!access.staff && access.vipAdmin) redirect('/admin/store');
  return <AdminDashboard labels={await buildLabels()} configured={!!db()} />;
}
