'use client';
import { Gamepad2 } from 'lucide-react';
import { useLang } from '@/lib/providers';
import { useStatus } from '@/lib/useStatus';
import { fivemConnectUrl } from '@/lib/site';

/** Hero pill: "Online · 87/128 players" (hidden when the server isn't configured). */
export function ServerStatusPill() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const status = useStatus();
  const s = status?.server;

  if (!s) {
    return (
      <span className="pill backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-brand animate-pulse-dot" />
        FiveM • Serious RP
      </span>
    );
  }

  return (
    <span
      className={`pill backdrop-blur ${s.online ? '' : 'border-red-400/30 bg-red-400/10 text-red-300'}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <span className={`h-2 w-2 rounded-full ${s.online ? 'bg-brand animate-pulse-dot' : 'bg-red-400'}`} />
      {s.online ? (
        <>
          {isAr ? 'متصل' : 'Online'} · <span dir="ltr" className="tabular-nums">{s.players}/{s.max}</span>{' '}
          {isAr ? 'لاعب' : 'players'}
        </>
      ) : isAr ? (
        'السيرفر غير متصل'
      ) : (
        'Server offline'
      )}
    </span>
  );
}

/** One-click "Connect" button that opens FiveM (hidden when not configured). */
export function ConnectButton() {
  const { lang } = useLang();
  const url = fivemConnectUrl();
  if (!url) return null;
  return (
    <a href={url} className="btn btn-outline backdrop-blur">
      <Gamepad2 className="h-4 w-4" />
      {lang === 'ar' ? 'اتصل بالسيرفر' : 'Connect'}
    </a>
  );
}
