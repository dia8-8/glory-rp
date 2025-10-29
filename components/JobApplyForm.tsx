'use client';
import { useEffect, useMemo, useState } from 'react';
import { tClient as T } from '@/lib/i18n-client';
import type { Field } from '@/lib/jobs';

type Lang = 'ar' | 'en';

export default function JobApplyForm({
  jobKey, fields, initialLang, discordName,
}: {
  jobKey: string;
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
      if (f.name === 'discord') continue;
      base[f.name] = '';
    }
    return base;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initial);
  useEffect(() => setForm(initial), [initial]);

  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'>('idle');
  const [msg, setMsg] = useState('');

  function onChange(
    e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = { ...form, discord: discordName };

      const res = await fetch(`/api/applications/${jobKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');

      setStatus('ok');
      setMsg(L.isAr ? 'تم الإرسال! سنعود إليك قريبًا.' : 'Application sent! We’ll get back to you soon.');
      setForm(initial);
    } catch (err: any) {
      setStatus('err');
      setMsg(err.message || 'Error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm opacity-80">{L.isAr ? 'حساب الدسكورد' : 'Discord Account'}</label>
        <input
          name="discord"
          value={discordName}
          readOnly
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 opacity-90"
          aria-readonly="true"
        />
        <p className="mt-1 text-xs opacity-70">
          {L.isAr ? 'تم جلبه من تسجيل دخول دسكورد.' : 'Auto-filled from your Discord sign-in.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          if (f.name === 'discord') return null;

          const label = L.isAr ? (f as any).labelAr : (f as any).labelEn;
          const placeholder = L.isAr ? (f as any).placeholderAr : (f as any).placeholderEn;

          if (f.type === 'text' || f.type === 'number') {
            return (
              <div key={f.name}>
                <label className="text-sm opacity-80">{label}</label>
                <input
                  name={f.name}
                  type={f.type === 'number' ? 'number' : 'text'}
                  min={(f as any).min}
                  max={(f as any).max}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  placeholder={placeholder}
                  required={!!(f as any).required}
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
                  required={!!(f as any).required}
                   className="mt-1 w-full rounded-xl border border-white/15 bg-[#2a0c4a]/40 text-white/90 px-3 py-2 outline-none transition focus:border-[#c27cff] focus:ring-1 focus:ring-[#c27cff]">
                  <option value="">{L.isAr ? 'اختر' : 'Select'}</option>
                  {(f as any).options.map((o: any) => (
                    <option key={o.value} value={o.value}>
                      {L.isAr ? o.labelAr : o.labelEn}
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
                required={!!(f as any).required}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/30"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs opacity-70">
          {L.isAr ? 'بنقرِك إرسال، توافق على أن يتم التواصل معك عبر الديسكورد.' : 'By submitting, you agree to be contacted on Discord.'}
        </div>
        <button type="submit" disabled={status==='loading'} className="btn btn-primary">
          {status==='loading' ? (L.isAr ? 'جارٍ الإرسال…' : 'Sending…') : (L.isAr ? 'إرسال' : 'Submit')}
        </button>
      </div>

      {status !== 'idle' && (
        <div className={`rounded-xl border px-3 py-2 text-sm ${status==='ok' ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' : status==='err' ? 'border-rose-400/30 text-rose-300 bg-rose-400/10' : 'border-white/20 text-white/80 bg-white/5'}`}>
          {msg}
        </div>
      )}
    </form>
  );
}
