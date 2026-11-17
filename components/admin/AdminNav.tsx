'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Inbox, Images, Newspaper, ListChecks } from 'lucide-react';
import { useLang } from '@/lib/providers';

const TABS = [
  { href: '/admin', en: 'Submissions', ar: 'الطلبات', Icon: Inbox, admin: false },
  { href: '/admin/gallery', en: 'Gallery', ar: 'المعرض', Icon: Images, admin: true },
  { href: '/admin/news', en: 'Updates', ar: 'الأخبار', Icon: Newspaper, admin: true },
  { href: '/admin/interview', en: 'Interview questions', ar: 'أسئلة المقابلة', Icon: ListChecks, admin: true },
];

export default function AdminNav({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const tabs = TABS.filter((t) => admin || !t.admin);
  if (tabs.length < 2) return null;

  return (
    <nav className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none]" aria-label="Admin">
      <ul className="flex w-max gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5">
        {tabs.map(({ href, en, ar, Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition',
                  active ? 'bg-brand text-ink' : 'text-white/65 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {lang === 'ar' ? ar : en}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
