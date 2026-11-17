'use client';

import { useMemo, useState } from 'react';
import { useLang } from '@/lib/providers';
import type { InterviewField } from '@/lib/interview';

/** Join interview form. Questions come from the admin panel (or the originals). */
export default function ApplyForm({ discordName, fields }: { discordName: string; fields: InterviewField[] }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const initial = useMemo(() => {
    const base: Record<string, string | boolean> = { rulesOk: false };
    for (const f of fields) base[f.name] = f.type === 'select' ? f.options?.[0]?.value ?? '' : '';
    return base;
  }, [fields]);

  const [form, setForm] = useState<Record<string, string | boolean>>(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rulesOk) {
      setStatus('err');
      setMsg(isAr ? 'يجب الموافقة على قراءة القوانين.' : 'You must confirm you read the rules.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/applications/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setStatus('ok');
      setMsg(isAr ? 'تم إرسال المقابلة! سنراجعها قريبًا.' : 'Interview sent! We’ll review it soon.');
      setForm(initial);
    } catch (err: any) {
      setStatus('err');
      setMsg(err.message || 'Error');
    }
  }

  const label = (f: InterviewField) => (isAr ? f.labelAr : f.labelEn);
  const placeholder = (f: InterviewField) => ('placeholderEn' in f ? (isAr ? f.placeholderAr : f.placeholderEn) : undefined);

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8">
      <div>
        <label className="text-sm opacity-80">{isAr ? 'حساب ديسكورد' : 'Discord Account'}</label>
        <input value={discordName} readOnly className="field cursor-not-allowed bg-white/5 text-white/60" />
        <p className="mt-1 text-xs text-white/60">{isAr ? 'تم جلبه من تسجيل الدخول.' : 'Fetched from your sign-in.'}</p>
      </div>

      {/* Short fields sit two per row on wider screens; long text takes the full row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `q-${f.name}`;
          const required = f.required !== false;
          const value = String(form[f.name] ?? '');
          return (
            <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}>
              <label htmlFor={id} className="text-sm opacity-80">
                {label(f)}
                {required && <span className="text-brand"> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea id={id} name={f.name} rows={4} value={value} onChange={onChange} placeholder={placeholder(f)} className="field" required={required} />
              ) : f.type === 'select' ? (
                <select id={id} name={f.name} value={value} onChange={onChange} className="field" required={required}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{isAr ? o.labelAr : o.labelEn}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={f.name}
                  type={f.type === 'number' ? 'number' : 'text'}
                  min={f.type === 'number' ? f.min : undefined}
                  max={f.type === 'number' ? f.max : undefined}
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder(f)}
                  className="field"
                  required={required}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm opacity-80">
          <input type="checkbox" name="rulesOk" checked={!!form.rulesOk} onChange={onChange} className="h-4 w-4 accent-brand" />
          <span>{isAr ? 'قرأت القوانين وأوافق عليها' : 'I read and accept the rules'}</span>
        </label>
        <button type="submit" disabled={status === 'loading'} className="btn btn-primary">
          {status === 'loading' ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : isAr ? 'إرسال' : 'Submit'}
        </button>
      </div>

      {status !== 'idle' && (
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            status === 'ok'
              ? 'border-brand/30 bg-brand/10 text-brand'
              : status === 'err'
                ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
                : 'border-white/20 bg-white/5 text-white/80'
          }`}
        >
          {msg}
        </div>
      )}
    </form>
  );
}
