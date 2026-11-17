import { getLang } from '@/lib/i18n-server';
import { STAFF, type StaffRank } from '@/data/staff';
import { BRAND } from '@/lib/brand';
import { Crown, ShieldCheck, Shield, Headset, Users, ArrowUpRight } from 'lucide-react';

export const metadata = { title: 'Staff Team' };

const RANKS: { key: StaffRank; en: string; ar: string; Icon: typeof Crown }[] = [
  { key: 'owner', en: 'Owners', ar: 'الإدارة العليا', Icon: Crown },
  { key: 'admin', en: 'Admins', ar: 'المشرفون', Icon: ShieldCheck },
  { key: 'mod', en: 'Moderators', ar: 'المراقبون', Icon: Shield },
  { key: 'support', en: 'Support', ar: 'الدعم الفني', Icon: Headset },
];

export default function StaffPage() {
  const isAr = getLang() === 'ar';

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:pt-36">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <span className="pill mb-4">
            <Users className="h-3.5 w-3.5" /> {isAr ? 'الفريق' : 'Team'}
          </span>
          <h1 className="section-title">{isAr ? 'فريق الإدارة' : 'Staff Team'}</h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" />
          <p className="mt-5 text-white/65">
            {isAr ? 'الفريق الذي يحافظ على المدينة عادلة وممتعة.' : 'The people keeping the city fair and fun.'}
          </p>
        </header>

        {STAFF.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-brand" />
            <h2 className="mt-4 text-xl font-bold">{isAr ? 'قريبًا' : 'Coming soon'}</h2>
            <p className="mt-2 text-white/60">
              {isAr ? 'سيتم نشر قائمة الفريق قريبًا. للتواصل مع الإدارة استخدم الديسكورد.' : 'The team list will be published soon. To reach staff, use our Discord.'}
            </p>
            <a href={BRAND.discord} target="_blank" rel="noreferrer" className="btn btn-outline mt-6">
              Discord <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-14">
            {RANKS.map(({ key, en, ar, Icon }) => {
              const members = STAFF.filter((m) => m.rank === key);
              if (!members.length) return null;
              return (
                <section key={key}>
                  <h2 className="mb-6 flex items-center gap-3 text-xl font-bold">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/25">
                      <Icon className="h-5 w-5" />
                    </span>
                    {isAr ? ar : en}
                    <span className="text-sm font-medium text-white/40">({members.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {members.map((m) => (
                      <div key={m.name} className="card card-hover flex flex-col items-center p-6 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatar || '/logo.png'}
                          alt={m.name}
                          className={`h-20 w-20 rounded-2xl bg-ink ring-2 ring-brand/40 ${m.avatar ? 'object-cover' : 'object-contain p-3'}`}
                        />
                        <p className="mt-4 font-bold">{m.name}</p>
                        <p className="mt-1 text-sm text-brand">{isAr ? m.role.ar : m.role.en}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
