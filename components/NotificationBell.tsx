'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';
import { timeAgo } from '@/lib/timeAgo';

type Item = {
  id: string;
  icon: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  note: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const POLL_MS = 60_000;

export default function NotificationBell() {
  const { status } = useSession();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Item | null>(null);
  const lastUnread = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/notifications', { cache: 'no-store' }).catch(() => null);
    if (!r?.ok) return;
    const j = await r.json();
    setItems(j.items ?? []);
    setUnread(j.unread ?? 0);
    // Pop a toast when something new arrives while the page is open
    if (lastUnread.current !== null && (j.unread ?? 0) > lastUnread.current && j.items?.[0]) setToast(j.items[0]);
    lastUnread.current = j.unread ?? 0;
  }, []);

  // Poll while signed in; refresh when the tab regains focus
  useEffect(() => {
    if (status !== 'authenticated') return;
    load();
    const t = setInterval(() => document.visibilityState === 'visible' && load(), POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
    };
  }, [status, load]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  async function markRead(ids?: string[]) {
    const now = new Date().toISOString();
    setItems((xs) => xs.map((x) => (!ids || ids.includes(x.id) ? { ...x, read_at: x.read_at ?? now } : x)));
    setUnread((u) => (ids ? Math.max(0, u - items.filter((x) => ids.includes(x.id) && !x.read_at).length) : 0));
    lastUnread.current = ids ? Math.max(0, (lastUnread.current ?? 0) - ids.length) : 0;
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids ? { ids } : {}),
    }).catch(() => {});
  }

  function openItem(n: Item) {
    if (!n.read_at) markRead([n.id]);
    setOpen(false);
    setToast(null);
    if (n.link) router.push(n.link);
  }

  if (status !== 'authenticated') return null;

  const title = (n: Item) => (isAr ? n.title_ar : n.title_en);
  const body = (n: Item) => (isAr ? n.body_ar : n.body_en);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost relative h-10 w-10 p-0"
        aria-label={isAr ? `الإشعارات (${unread} غير مقروءة)` : `Notifications (${unread} unread)`}
        aria-expanded={open}
      >
        <Bell className={clsx('h-5 w-5', unread > 0 && 'animate-[ring_1.2s_ease-in-out_1]')} />
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-extrabold text-ink ring-2 ring-ink">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-20 z-[70] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-96"
            role="dialog"
            aria-label={isAr ? 'الإشعارات' : 'Notifications'}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <h3 className="font-bold">{isAr ? 'الإشعارات' : 'Notifications'}</h3>
              {unread > 0 && (
                <button onClick={() => markRead()} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-white/45">
                <BellOff className="mx-auto mb-3 h-8 w-8 text-white/20" />
                {isAr ? 'لا توجد إشعارات بعد.' : 'No notifications yet.'}
              </div>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-white/[0.05] overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => openItem(n)}
                      className={clsx(
                        'flex w-full gap-3 px-4 py-3.5 text-start transition hover:bg-white/[0.04]',
                        !n.read_at && 'bg-brand/[0.05]'
                      )}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-lg">{n.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className={clsx('block text-sm', n.read_at ? 'text-white/75' : 'font-semibold text-white')}>{title(n)}</span>
                        {body(n) && <span className="mt-0.5 block text-xs text-white/50">{body(n)}</span>}
                        {n.note && <span className="mt-1.5 block rounded-lg bg-ink/60 px-2 py-1 text-xs text-white/65">📝 {n.note}</span>}
                        <span className="mt-1 block text-[11px] text-white/35">{timeAgo(n.created_at, isAr)}</span>
                      </span>
                      {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="unread" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast for new notifications */}
      <AnimatePresence>
        {toast && !open && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => openItem(toast)}
            className="fixed bottom-24 end-4 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border border-brand/30 bg-surface p-4 text-start shadow-2xl lg:bottom-6"
          >
            <span className="text-xl">{toast.icon}</span>
            <span>
              <span className="block text-sm font-semibold">{title(toast)}</span>
              <span className="mt-0.5 block text-xs text-white/55">{body(toast)}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
