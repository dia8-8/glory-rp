import Link from 'next/link';
import Image from 'next/image';
import { t, getLang } from '@/lib/i18n-server';
import { BRAND } from '@/lib/brand';
import { SiDiscord, SiTiktok } from 'react-icons/si';

export default function Footer() {
  const L = t(getLang());
  const links = [
    { href: '/streamers', label: L.nav.streamers },
    { href: '/rules', label: L.nav.rules },
    { href: '/jobs', label: L.nav.jobs },
    { href: '/vipshop', label: L.nav.store },
    { href: '/news', label: L.isAr ? 'الأخبار' : 'News' },
    { href: '/staff', label: L.isAr ? 'الفريق' : 'Staff' },
    { href: '/status', label: L.isAr ? 'حالة طلبي' : 'My Application' },
    { href: '/#faq', label: L.isAr ? 'الأسئلة الشائعة' : 'FAQ' },
  ];
  const socials = [
    { href: BRAND.discord, label: 'Discord', Icon: SiDiscord },
    { href: BRAND.tiktok, label: 'TikTok', Icon: SiTiktok },
  ];

  return (
    <footer className="relative mt-auto bg-ink text-sm text-white/60">
      <div className="divider-glow" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:items-center">
        <Link href="/" className="flex items-center gap-3 justify-self-center sm:justify-self-start">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-contain" />
          <span className="text-lg font-extrabold text-white">{L.brand}</span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-center gap-3 sm:justify-end">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/70 transition hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-white/[0.06] py-5 text-center text-xs text-white/40">{L.footer}</div>
    </footer>
  );
}
