'use client';

import { useEffect, useMemo, useState } from 'react';
import { tClient as T } from '@/lib/i18n-client';
import type { TicketKey } from '@/lib/tickets';

type Lang = 'ar' | 'en';

type Option =
  | string
  | { value: string; labelEn: string; labelAr: string };

type Field = {
  name: string;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  type: 'text' | 'number' | 'textarea' | 'email' | 'select' | 'checkbox';
  required?: boolean;
  options?: Option[];
};

export default function TicketForm({
  categoryKey,
  fields,
  initialLang,
  discordName,
  user,
}: {
  categoryKey: TicketKey;
  fields: Field[];
  initialLang: Lang;
  discordName: string;
  user?: { email?: string | null };
}) {

  const [lang, setLang] = useState<Lang>(initialLang);
  const L = T(lang);

  // 🌐 Detect language from cookie
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(ar|en)/);
    if (m && (m[1] === 'ar' || m[1] === 'en') && m[1] !== lang)
      setLang(m[1] as Lang);
  }, [lang]);

  // 🧩 Initialize field defaults
  const initial = useMemo(() => {
    const base: Record<string, any> = {};
    for (const f of fields) base[f.name] = f.type === 'checkbox' ? false : '';
    return base;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initial);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => setForm(initial), [initial]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  // 🔧 Input change handler (safe for all input types)
  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const { name } = target;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // 🚀 Submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const payload = { ...form, discord: discordName };

      const res = await fetch(`/api/tickets/${categoryKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');

      setStatus('ok');
      setMsg(
        L.isAr
          ? 'تم إرسال التذكرة بنجاح! سيتم مراجعتها قريباً.'
          : 'Ticket submitted successfully! We’ll review it soon.'
      );

      // ✅ Fully reset form
      setForm(initial);
      setFormKey((k) => k + 1);
    } catch (err: any) {
      setStatus('err');
      setMsg(err.message || 'Error');
    }
  }

  return (
    <form key={formKey} onSubmit={onSubmit} className="space-y-5">
      {/* Section Header */}
      <h2 className="text-lg font-semibold opacity-80 border-b border-white/10 pb-1 mb-3">
        {L.isAr ? 'تفاصيل التذكرة' : 'Ticket Details'}
      </h2>

      {/* Discord Account */}
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

      {/* Dynamic Fields */}
      <div
        className={`grid gap-4 ${
          fields.length > 6 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'
        }`}
      >
        {fields.map((f) => {
          const label = L.isAr ? f.labelAr : f.labelEn;
          const placeholder = L.isAr ? f.placeholderAr : f.placeholderEn;

          // 🧾 Text / Number / Email
          if (['text', 'number', 'email'].includes(f.type)) {
            return (
              <div key={f.name}>
                <label className="text-sm opacity-80">{label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  placeholder={placeholder}
                  required={!!f.required}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-[#a60be3] focus:ring-1 focus:ring-[#a60be3]"
                />
              </div>
            );
          }

          // 📝 Textarea (always full-width)
          if (f.type === 'textarea') {
            return (
              <div key={f.name} className="sm:col-span-2">
                <label className="text-sm opacity-80">{label}</label>
                <textarea
                  name={f.name}
                  rows={5}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  required={!!f.required}
                  placeholder={placeholder}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white/90 outline-none focus:border-[#a60be3] focus:ring-1 focus:ring-[#a60be3]"
                />
              </div>
            );
          }

          // ⬇️ Select
          if (f.type === 'select') {
            return (
              <div key={f.name} className="sm:col-span-2">
                <label className="text-sm opacity-80">{label}</label>
                <select
                  name={f.name}
                  value={form[f.name] ?? ''}
                  onChange={onChange}
                  required={!!f.required}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#2a0c4a]/40 text-white/90 px-3 py-2 outline-none transition focus:border-[#c27cff] focus:ring-1 focus:ring-[#c27cff] appearance-none"
                >
                  <option disabled value="">
                    {L.isAr ? 'اختر خياراً' : 'Select an option'}
                  </option>
                  {f.options?.map((o: any) => {
                    const value = typeof o === 'string' ? o : o.value;
                    const labelText =
                      typeof o === 'string'
                        ? o
                        : L.isAr
                        ? o.labelAr
                        : o.labelEn;
                    return (
                      <option key={value} value={value}>
                        {labelText}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          }

          // ☑️ Checkbox
          if (f.type === 'checkbox') {
            return (
              <div
                key={f.name}
                className="sm:col-span-2 flex items-center gap-3 mt-2"
              >
                <input
                  id={f.name}
                  name={f.name}
                  type="checkbox"
                  checked={!!form[f.name]}
                  onChange={onChange}
                  required={!!f.required}
                  className="h-5 w-5 accent-[#a60be3] rounded-md border border-white/30 bg-white/10 cursor-pointer"
                />
                <label
                  htmlFor={f.name}
                  className="text-sm opacity-90 cursor-pointer select-none"
                >
                  {label}
                </label>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* 📤 Submit */}
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

      {/* 🧾 Status Messages */}
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
