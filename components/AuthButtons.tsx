'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { tClient as T, getLangClient } from '@/lib/i18n-client';

export default function AuthButtons() {
  const { status } = useSession();
  const [loading, setLoading] = useState<'in'|'out'|null>(null);

  const L = T(getLangClient());
  const isAr = L.isAr;

  if (status === 'loading') {
    return (
      <button className="btn btn-ghost" disabled aria-busy>
        {isAr ? '...' : '...'}
      </button>
    );
  }

  if (status === 'authenticated') {
    return (
      <button
        className="btn btn-ghost"
        onClick={async () => { setLoading('out'); await signOut({ callbackUrl: '/' }); }}
        disabled={loading==='out'}
      >
        {loading==='out'
          ? (isAr ? 'جارٍ تسجيل الخروج…' : 'Logging out…')
          : (isAr ? 'تسجيل الخروج' : 'Logout')}
      </button>
    );
  }

  return (
    <button
      className="btn btn-primary"
      onClick={async () => { setLoading('in'); await signIn('discord', { callbackUrl: '/jobs' }); }}
      disabled={loading==='in'}
    >
      {loading==='in'
        ? (isAr ? 'جارٍ الفتح…' : 'Opening…')
        : (isAr ? 'تسجيل الدخول' : 'Sign in')}
    </button>
  );
}
