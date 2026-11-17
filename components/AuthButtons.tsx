'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ClipboardCheck, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { tClient as T } from '@/lib/i18n-client';
import { useLang } from '@/lib/providers';

export default function AuthButtons() {
  const { status, data: session } = useSession();
  const [loading, setLoading] = useState<'in'|'out'|null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  // Show the dashboard link only to staff
  const [staff, setStaff] = useState(false);
  const [vipOnly, setVipOnly] = useState(false);
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : { staff: false }))
      .then((j) => {
        setStaff(!!j.staff || !!j.vipAdmin);
        setVipOnly(!j.staff && !!j.vipAdmin);
      })
      .catch(() => {});
  }, [status]);

  const { lang } = useLang();
  const L = T(lang);
  const isAr = L.isAr;

  if (status === 'loading') {
    return (
      <button className="btn btn-ghost" disabled aria-busy>
        {isAr ? '...' : '...'}
      </button>
    );
  }

  if (status === 'authenticated') {
    const user = session?.user;
    return (
      <div className="relative" ref={menuRef}>
        <button
          className="btn btn-ghost gap-2 px-2 sm:pe-3"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
          <span className="hidden max-w-[110px] truncate sm:inline">{user?.name}</span>
          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div
            role="menu"
            className="absolute end-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-surface p-1.5 shadow-2xl"
          >
            <Link
              href="/status"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
            >
              <ClipboardCheck className="h-4 w-4 text-brand" />
              {isAr ? 'حالة طلبي' : 'My Application'}
            </Link>
            {staff && (
              <Link
                href={vipOnly ? '/admin/store' : '/admin'}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                <ShieldCheck className="h-4 w-4 text-brand" />
                {vipOnly ? (isAr ? 'إدارة المتجر' : 'Manage store') : isAr ? 'لوحة الإدارة' : 'Staff Dashboard'}
              </Link>
            )}
            <button
              role="menuitem"
              onClick={async () => { setLoading('out'); await signOut({ callbackUrl: '/' }); }}
              disabled={loading === 'out'}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm text-white/80 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4 text-red-300" />
              {loading === 'out' ? (isAr ? 'جارٍ تسجيل الخروج…' : 'Logging out…') : (isAr ? 'تسجيل الخروج' : 'Logout')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className="btn btn-primary"
      onClick={async () => { setLoading('in'); await signIn('discord', { callbackUrl: '/' }); }}
      disabled={loading==='in'}
    >
      {loading==='in'
        ? (isAr ? 'جارٍ الفتح…' : 'Opening…')
        : (isAr ? 'تسجيل الدخول' : 'Sign in')}
    </button>
  );
}
