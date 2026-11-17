'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

type NavLink = { href: string; label: string };

export default function NavbarShell({
  brand,
  links,
  cta,
  actions,
}: {
  brand: string;
  links: NavLink[];
  cta: ReactNode;
  actions: ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={clsx(
          // Mobile: logo | buttons. Desktop: equal side columns so the links sit in the exact centre.
          'mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-all duration-300 sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]',
          scrolled || open
            ? 'border-white/10 bg-ink/80 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <Link href="/" className="group flex items-center gap-3 lg:justify-self-start">
          <span className="relative">
            <Image
              src="/logo.png"
              alt="Glory RP logo"
              width={56}
              height={56}
              priority
              className="relative h-11 w-11 rounded-xl object-contain sm:h-12 sm:w-12"
              sizes="56px"
            />
          </span>
          <span className="text-lg font-extrabold tracking-tight sm:text-xl">{brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                isActive(l.href) ? 'text-ink' : 'text-white/70 hover:text-white'
              )}
            >
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-brand"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:justify-self-end">
          <div className="hidden lg:block">{cta}</div>
          {actions}
          <button
            className="btn btn-ghost px-2.5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 flex max-w-7xl flex-col gap-1 rounded-2xl border border-white/10 bg-ink/95 p-2 backdrop-blur-xl lg:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive(l.href) ? 'bg-brand/15 text-brand' : 'text-white/80 hover:bg-white/5'
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="p-2 [&>*]:w-full">{cta}</div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
