'use client';

import { useEffect, useState } from 'react';
import { tClient as T } from '@/lib/i18n-client';

type Lang = 'ar' | 'en';

export default function ApplyForm({
  initialLang,
  discordName,
}: {
  initialLang: Lang;
  discordName: string;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(ar|en)/);
    if (m && (m[1] === 'ar' || m[1] === 'en') && m[1] !== lang) setLang(m[1] as Lang);
  }, [lang]);

  const L = T(lang);
  const isAr = L.isAr;

  const [form, setForm] = useState({
    name: '',
    age: '',
    timezone: '',
    hours: '',
    experience: '',
    mic: 'yes',
    rulesOk: false,
    steam: '',
    about: '',
  });
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'>('idle');
  const [msg, setMsg] = useState('');

  function onChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as any;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? !!checked : value }));
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
      setForm({ name:'', age: '', timezone: '', hours: '', experience: '', mic: 'yes', rulesOk: false, steam: '', about: '' });
    } catch (err:any) {
      setStatus('err'); setMsg(err.message || 'Error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-[#170930] p-6 rounded-xl">
      <div>
        <label className="text-sm opacity-80">{isAr ? 'حساب ديسكورد' : 'Discord Account'}</label>
        <input
          value={discordName}
          readOnly
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white/90"
        />
        <p className="mt-1 text-xs text-white/60">{isAr ? 'تم جلبه من تسجيل الدخول.' : 'Fetched from your sign-in.'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
            <label className="text-sm opacity-80">{isAr ? 'اسم شخصيتك' : 'Your character name'}</label>
            <input name="name" placeholder={isAr ? 'يجب أن يكون الاسم الحقيقي' : 'Must be a real name'} value={form.name} onChange={onChange}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
        </div>
        <div>
          <label className="text-sm opacity-80">{isAr ? 'العمر' : 'Age'}</label>
          <input name="age" type="number" min={16} value={form.age} onChange={onChange}
                 className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
        </div>
        {/* <div>
          <label className="text-sm opacity-80">{isAr ? 'المنطقة الزمنية' : 'Timezone'}</label>
          <input name="timezone" placeholder={isAr ? 'مثال: GMT+3' : 'e.g. GMT+3'} value={form.timezone} onChange={onChange}
                 className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        {/* <div>
          <label className="text-sm opacity-80">{isAr ? 'ساعات اللعب أسبوعيًا' : 'Hours per week'}</label>
          <input name="hours" type="number" min={0} value={form.hours} onChange={onChange}
                 className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
        </div> */}
        <div>
          <label className="text-sm opacity-80">{isAr ? 'هل لديك مايكروفون؟' : 'Do you have a microphone?'}</label>
          <select name="mic" value={form.mic} onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#a60be3]/80 text-white/90 px-3 py-2 outline-none transition focus:border-[#c27cff] focus:ring-1 focus:ring-[#c27cff] appearance-none custom-select">
            <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
            <option value="no">{isAr ? 'لا' : 'No'}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm opacity-80">{isAr ? 'خبرتك السابقة في RP' : 'Your RP experience'}</label>
        <textarea name="experience" rows={4} value={form.experience} onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
      </div>

      <div>
        <label className="text-sm opacity-80">{isAr ? 'رابط Steam' : 'Steam link'}</label>
        <input name="steam" value={form.steam} onChange={onChange}
               className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" placeholder="https://..." required />
      </div>

      {/* Last row: About (alone) */}
      <div>
        <label className="text-sm opacity-80">{isAr ? ' قصة شخصيتك' : 'Your character story'}</label>
        <textarea name="about" rows={5} value={form.about} onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2" required />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm opacity-80">
          <input type="checkbox" name="rulesOk" checked={form.rulesOk} onChange={onChange} />
          <span>{isAr ? 'قرأت القوانين وأوافق عليها' : 'I read and accept the rules'}</span>
        </label>
        <button type="submit" disabled={status==='loading'} className="btn btn-primary">
          {status==='loading' ? (isAr ? 'جارٍ الإرسال…' : 'Sending…') : (isAr ? 'إرسال' : 'Submit')}
        </button>
      </div>

      {status !== 'idle' && (
        <div className={`rounded-xl border px-3 py-2 text-sm ${
          status==='ok' ? 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10'
                        : status==='err' ? 'border-rose-400/30 text-rose-300 bg-rose-400/10'
                                         : 'border-white/20 text-white/80 bg-white/5'}`}>
          {msg}
        </div>
      )}
    </form>
  );
}
