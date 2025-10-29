'use client';

import { useEffect, useMemo, useState } from 'react';
import { tClient as T } from '@/lib/i18n-client';
import type { CityhallKey } from '@/lib/cityhall';

type Lang = 'ar' | 'en';

type Field = {
  name: string;
  labelEn: string;
  labelAr: string;
  type: 'text' | 'textarea' | 'email' | 'select';
  required?: boolean;
  options?: string[];
};

export default function CityHallForm({
  categoryKey,
  fields,
  initialLang,
  discordName,
}: {
  categoryKey: CityhallKey;
  fields: Field[];
  initialLang: Lang;
  discordName: string;
  user: { email?: string | null };
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(ar|en)/);
    if (m && (m[1] === 'ar' || m[1] === 'en') && m[1] !== lang) setLang(m[1] as Lang);
  }, [lang]);
  const L = T(lang);

  const initial = useMemo(() => {
    const base: Record<string, any> = {};
    for (const f of fields) {
      base[f.name] = '';
    }
    return base;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initial);
  useEffect(() => setForm(initial), [initial]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = { ...form, discord: discordName };

      const res = await fetch(`/api/cityhall/${categoryKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');

      setStatus('ok');
      setMsg(
        L.isAr
          ? 'تم إرسال النموذج بنجاح! سنراجع الطلب قريبًا.'
          : 'Form submitted successfully! We’ll review your request soon.'
      );
      setForm(initial);
    } catch (err: any) {
      setStatus('err');
      setMsg(err.message || 'Error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm opacity-80">
          {L.isAr ? 'حساب الديسكورد' : 'Discord Account'}
        </label>
        <input
          name="discord"
          value={discordName}
          readOnly
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 opacity-90"
          aria-readonly="true"
        />
        <p className="mt-1 text-xs opacity-70">
          {L.isAr
            ? 'تم جلب الحساب تلقائيًا من تسجيل دخولك.'
            : 'Auto-filled from your Discord sign-in.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const label = L.isAr ? f.labelAr : f.labelEn;
          if (f.type === 'text' || f.type === 'email') {
            return (
              <div key={f.name}>
                <label className="text-sm opacity-80">{label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  required={!!f.required}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
                />
              </div>
            );
          }

          if (f.type === 'select') {
            return (
              <div key={f.name}>
                <label className="text-sm opacity-80">{label}</label>
                <select
                  name={f.name}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  required={!!f.required}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                >
                  <option value="">{L.isAr ? 'اختر' : 'Select'}</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={f.name} className="sm:col-span-2">
              <label className="text-sm opacity-80">{label}</label>
              <textarea
                name={f.name}
                rows={5}
                value={form[f.name] ?? ''}
                onChange={onChange}
                required={!!f.required}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs opacity-70">
          {L.isAr
            ? 'بنقرِك إرسال، توافق على أن يتم التواصل معك عبر الديسكورد.'
            : 'By submitting, you agree to be contacted on Discord.'}
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn btn-primary"
        >
          {status === 'loading'
            ? L.isAr
              ? 'جارٍ الإرسال…'
              : 'Sending…'
            : L.isAr
            ? 'إرسال'
            : 'Submit'}
        </button>
      </div>

      {status !== 'idle' && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            status === 'ok'
              ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10'
              : status === 'err'
              ? 'border-rose-400/30 text-rose-300 bg-rose-400/10'
              : 'border-white/20 text-white/80 bg-white/5'
          }`}
        >
          {msg}
        </div>
      )}
    </form>
  );
}
