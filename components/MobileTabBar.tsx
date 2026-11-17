'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Briefcase, Store, Radio } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';

const TABS = [
  { href: '/', en: 'Home', ar: 'الرئيسية', Icon: Home },
  { href: '/rules', en: 'Rules', ar: 'القوانين', Icon: BookOpen },
  { href: '/jobs', en: 'Jobs', ar: 'الوظائف', Icon: Briefcase },
  { href: '/streamers', en: 'Streamers', ar: 'البثوث', Icon: Radio },
  { href: '/vipshop', en: 'Store', ar: 'المتجر', Icon: Store },
];

/** Thumb-friendly bottom navigation, phones/tablets only. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <>
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {TABS.map(({ href, en, ar, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition',
                    active ? 'text-brand' : 'text-white/55 hover:text-white'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />}
                  <Icon className="h-5 w-5" />
                  {lang === 'ar' ? ar : en}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
