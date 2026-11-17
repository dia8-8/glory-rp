'use client';
// Small building blocks shared by the admin content editors.
import { ReactNode } from 'react';
import { Database, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

/** fetch JSON with a consistent { ok, data, error } result */
export async function api<T = any>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T; error?: string }> {
  try {
    const r = await fetch(url, {
      ...init,
      headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, data, error: r.ok ? undefined : data?.error || `Error ${r.status}` };
  } catch {
    return { ok: false, data: {} as T, error: 'Network error' };
  }
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-white/55">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Shown when the SQL script hasn't been run yet */
export function SetupNeeded({ isAr, file = 'supabase/004_content.sql' }: { isAr: boolean; file?: string }) {
  return (
    <div className="card max-w-2xl p-8">
      <Database className="h-10 w-10 text-brand" />
      <h2 className="mt-4 text-2xl font-extrabold">{isAr ? 'خطوة إعداد واحدة' : 'One setup step needed'}</h2>
      <p className="mt-2 text-white/65">
        {isAr ? 'جداول المحتوى غير موجودة بعد في Supabase.' : 'The content tables don’t exist in Supabase yet.'}
      </p>
      <ol className="mt-5 list-decimal space-y-2 ps-5 text-sm text-white/75">
        <li>{isAr ? 'افتح Supabase ← SQL Editor ← New query' : 'Open Supabase → SQL Editor → New query'}</li>
        <li>
          {isAr ? 'الصق محتوى ' : 'Paste the contents of '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-brand">{file}</code>
          {isAr ? ' واضغط Run' : ' and press Run'}
        </li>
        <li>{isAr ? 'حدّث هذه الصفحة' : 'Refresh this page'}</li>
      </ol>
    </div>
  );
}

export function AdminsOnly({ isAr, vip }: { isAr: boolean; vip?: boolean }) {
  return (
    <div className="card max-w-lg p-8">
      <ShieldAlert className="h-10 w-10 text-red-300" />
      <h2 className="mt-4 text-2xl font-extrabold">{vip ? (isAr ? 'لإدارة المتجر فقط' : 'VIP admins only') : isAr ? 'للأدمن فقط' : 'Admins only'}</h2>
      <p className="mt-2 text-white/60">
        {vip
          ? isAr ? 'تحتاج رتبة VIP Admin في الديسكورد لإدارة المتجر.' : 'You need the VIP Admin role on Discord to manage the store.'
          : isAr ? 'تحتاج رتبة الأدمن في الديسكورد لتعديل محتوى الموقع.' : 'You need the Admin role on Discord to edit site content.'}
      </p>
    </div>
  );
}

/** Two inputs side by side: English + Arabic */
export function BiInput({
  label, en, ar, onEn, onAr, textarea, rows = 3, max, placeholderEn, placeholderAr,
}: {
  label: string; en: string; ar: string; onEn: (v: string) => void; onAr: (v: string) => void;
  textarea?: boolean; rows?: number; max?: number; placeholderEn?: string; placeholderAr?: string;
}) {
  const cls = 'field mt-1 text-sm';
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {textarea ? (
          <>
            <textarea dir="ltr" rows={rows} maxLength={max} className={clsx(cls, 'resize-y')} value={en} placeholder={placeholderEn ?? 'English'} onChange={(e) => onEn(e.target.value)} />
            <textarea dir="rtl" rows={rows} maxLength={max} className={clsx(cls, 'resize-y')} value={ar} placeholder={placeholderAr ?? 'عربي'} onChange={(e) => onAr(e.target.value)} />
          </>
        ) : (
          <>
            <input dir="ltr" maxLength={max} className={cls} value={en} placeholder={placeholderEn ?? 'English'} onChange={(e) => onEn(e.target.value)} />
            <input dir="rtl" maxLength={max} className={cls} value={ar} placeholder={placeholderAr ?? 'عربي'} onChange={(e) => onAr(e.target.value)} />
          </>
        )}
      </div>
    </div>
  );
}

export function Notice({ kind, children }: { kind: 'ok' | 'err'; children: ReactNode }) {
  return (
    <p className={clsx('rounded-xl border px-3 py-2 text-sm', kind === 'ok' ? 'border-brand/30 bg-brand/10 text-brand' : 'border-red-400/30 bg-red-400/10 text-red-300')}>
      {children}
    </p>
  );
}
