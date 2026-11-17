'use client';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Save, RotateCcw, ExternalLink, X } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';
import { api, PageHeader, SetupNeeded, BiInput, Notice } from './ui';

type Option = { value: string; labelEn: string; labelAr: string };
type Q = {
  type: 'text' | 'number' | 'textarea' | 'select';
  name: string;
  required?: boolean;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  min?: number | string;
  max?: number | string;
  options?: Option[];
  _k?: number; // local key for React
};
type Data = { fields: Q[]; source: 'database' | 'default' };

const TYPES: { v: Q['type']; en: string; ar: string }[] = [
  { v: 'text', en: 'Short text', ar: 'نص قصير' },
  { v: 'textarea', en: 'Long text', ar: 'نص طويل' },
  { v: 'number', en: 'Number', ar: 'رقم' },
  { v: 'select', en: 'Choice (dropdown)', ar: 'اختيار من قائمة' },
];

let seq = 1;
const withKeys = (fs: Q[]) => fs.map((f) => ({ ...f, _k: seq++ }));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);

export default function InterviewEditor() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [fields, setFields] = useState<Q[] | null>(null);
  const [source, setSource] = useState<Data['source']>('default');
  const [setup, setSetup] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function apply(r: { ok: boolean; data: any; error?: string }, okText?: string) {
    if (r.ok) {
      setFields(withKeys(r.data.fields));
      setSource(r.data.source);
      setDirty(false);
      if (okText) setMsg({ kind: 'ok', text: okText });
    } else if (r.error === 'setup-needed') setSetup(true);
    else setMsg({ kind: 'err', text: r.error || 'Error' });
  }

  useEffect(() => {
    api<Data>('/api/admin/interview').then((r) => apply(r));
  }, []);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const update = (i: number, patch: Partial<Q>) => {
    setFields((fs) => fs!.map((f, j) => (j === i ? { ...f, ...patch } : f)));
    setDirty(true);
  };
  const move = (i: number, d: -1 | 1) => {
    setFields((fs) => {
      const a = [...fs!];
      const j = i + d;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
    setDirty(true);
  };
  const remove = (i: number) => {
    if (!confirm(isAr ? 'حذف هذا السؤال؟' : 'Remove this question?')) return;
    setFields((fs) => fs!.filter((_, j) => j !== i));
    setDirty(true);
  };
  const add = () => {
    setFields((fs) => [...fs!, { type: 'text', name: '', required: true, labelEn: '', labelAr: '', _k: seq++ }]);
    setDirty(true);
  };

  async function save() {
    if (!fields) return;
    setBusy(true);
    setMsg(null);
    // fill missing keys from the English question
    const payload = fields.map(({ _k, ...f }, i) => ({ ...f, name: f.name || slug(f.labelEn) || `q${i + 1}` }));
    const r = await api('/api/admin/interview', { method: 'PUT', body: JSON.stringify({ fields: payload }) });
    setBusy(false);
    apply(r, isAr ? 'تم الحفظ — الأسئلة الجديدة تظهر الآن في المقابلة.' : 'Saved — the new questions are live on the interview.');
  }

  async function reset() {
    if (!confirm(isAr ? 'الرجوع للأسئلة الأصلية؟ ستفقد التعديلات.' : 'Go back to the original questions? Your changes will be lost.')) return;
    setBusy(true);
    apply(await api('/api/admin/interview', { method: 'DELETE' }), isAr ? 'تمت الاستعادة.' : 'Restored the original questions.');
    setBusy(false);
  }

  if (setup) return <SetupNeeded isAr={isAr} />;
  if (!fields) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />;

  return (
    <div>
      <PageHeader
        title={isAr ? 'أسئلة المقابلة' : 'Interview questions'}
        subtitle={
          isAr
            ? 'الأسئلة التي يجيب عليها اللاعب بعد اجتياز اختبار القوانين. خانة "قرأت القوانين" تبقى دائمًا في الأسفل.'
            : 'What players answer after passing the rules quiz. The “I read the rules” checkbox always stays at the bottom.'
        }
      >
        <a href="/apply" target="_blank" className="btn btn-ghost">
          <ExternalLink className="h-4 w-4" /> {isAr ? 'صفحة التقديم' : 'Apply page'}
        </a>
        {source === 'database' && (
          <button onClick={reset} disabled={busy} className="btn btn-ghost">
            <RotateCcw className="h-4 w-4" /> {isAr ? 'الأسئلة الأصلية' : 'Reset to original'}
          </button>
        )}
      </PageHeader>

      {source === 'default' && (
        <p className="mb-5 text-sm text-white/50">
          {isAr ? 'تعرض الآن الأسئلة الأصلية. عدّلها واضغط حفظ لنشر نسختك.' : 'Showing the original questions. Edit and press Save to publish your version.'}
        </p>
      )}

      <ol className="space-y-4">
        {fields.map((f, i) => (
          <li key={f._k} className="card p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-sm font-bold text-brand">{i + 1}</span>
              <select
                value={f.type}
                onChange={(e) => {
                  const type = e.target.value as Q['type'];
                  update(i, {
                    type,
                    options: type === 'select' && !f.options?.length
                      ? [{ value: 'yes', labelEn: 'Yes', labelAr: 'نعم' }, { value: 'no', labelEn: 'No', labelAr: 'لا' }]
                      : f.options,
                  });
                }}
                className="field mt-0 w-auto py-1.5 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t.v} value={t.v}>{isAr ? t.ar : t.en}</option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-white/70">
                <input type="checkbox" className="h-4 w-4 accent-brand" checked={f.required !== false} onChange={(e) => update(i, { required: e.target.checked })} />
                {isAr ? 'إجباري' : 'Required'}
              </label>
              <div className="ms-auto flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="btn btn-ghost h-8 w-8 p-0" title={isAr ? 'لأعلى' : 'Move up'}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === fields.length - 1} className="btn btn-ghost h-8 w-8 p-0" title={isAr ? 'لأسفل' : 'Move down'}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => remove(i)} className="btn h-8 w-8 border border-red-400/40 bg-red-400/10 p-0 text-red-300 hover:bg-red-400/20" title={isAr ? 'حذف' : 'Remove'}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <BiInput
                label={isAr ? 'السؤال' : 'Question'}
                en={f.labelEn} ar={f.labelAr} max={200}
                onEn={(v) => update(i, { labelEn: v })} onAr={(v) => update(i, { labelAr: v })}
              />

              {f.type !== 'select' && (
                <BiInput
                  label={isAr ? 'نص توضيحي (اختياري)' : 'Hint inside the box (optional)'}
                  en={f.placeholderEn ?? ''} ar={f.placeholderAr ?? ''} max={200}
                  onEn={(v) => update(i, { placeholderEn: v })} onAr={(v) => update(i, { placeholderAr: v })}
                />
              )}

              {f.type === 'number' && (
                <div className="grid max-w-sm grid-cols-2 gap-2">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'أقل قيمة' : 'Minimum'}</span>
                    <input type="number" dir="ltr" className="field mt-1 text-sm" value={f.min ?? ''} onChange={(e) => update(i, { min: e.target.value })} />
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'أعلى قيمة' : 'Maximum'}</span>
                    <input type="number" dir="ltr" className="field mt-1 text-sm" value={f.max ?? ''} onChange={(e) => update(i, { max: e.target.value })} />
                  </label>
                </div>
              )}

              {f.type === 'select' && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'الخيارات' : 'Options'}</span>
                  <ul className="mt-1 space-y-2">
                    {(f.options ?? []).map((o, oi) => (
                      <li key={oi} className="flex gap-2">
                        <input dir="ltr" className="field mt-0 text-sm" placeholder="English" value={o.labelEn}
                          onChange={(e) => update(i, { options: f.options!.map((x, j) => (j === oi ? { ...x, labelEn: e.target.value, value: x.value || slug(e.target.value) } : x)) })} />
                        <input dir="rtl" className="field mt-0 text-sm" placeholder="عربي" value={o.labelAr}
                          onChange={(e) => update(i, { options: f.options!.map((x, j) => (j === oi ? { ...x, labelAr: e.target.value } : x)) })} />
                        <button
                          onClick={() => update(i, { options: f.options!.filter((_, j) => j !== oi) })}
                          className="btn btn-ghost h-10 w-10 shrink-0 p-0" title={isAr ? 'حذف الخيار' : 'Remove option'}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => update(i, { options: [...(f.options ?? []), { value: '', labelEn: '', labelAr: '' }] })}
                    className="btn btn-ghost mt-2 h-8 px-3 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> {isAr ? 'إضافة خيار' : 'Add option'}
                  </button>
                </div>
              )}

              <details className="text-xs text-white/45">
                <summary className="cursor-pointer select-none">{isAr ? 'متقدم: المفتاح' : 'Advanced: key'}</summary>
                <input
                  dir="ltr"
                  className="field mt-2 max-w-xs font-mono text-xs"
                  value={f.name}
                  placeholder={slug(f.labelEn) || 'auto'}
                  onChange={(e) => update(i, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                />
                <p className="mt-1">
                  {isAr
                    ? 'اسم داخلي للإجابة (حروف إنجليزية وأرقام و _). يُنشأ تلقائيًا إذا تُرك فارغًا.'
                    : 'Internal name for the answer (letters, numbers, _). Created automatically if left empty.'}
                </p>
              </details>
            </div>
          </li>
        ))}
      </ol>

      <button onClick={add} className="btn btn-outline mt-4 w-full border-dashed">
        <Plus className="h-4 w-4" /> {isAr ? 'إضافة سؤال' : 'Add question'}
      </button>

      {/* Sticky save bar */}
      <div
        className={clsx(
          'sticky bottom-20 z-30 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-surface/95 p-3 backdrop-blur lg:bottom-4',
          dirty ? 'border-brand/40' : 'border-white/10'
        )}
      >
        <button onClick={save} disabled={busy || !dirty} className="btn btn-primary">
          <Save className="h-4 w-4" /> {busy ? '…' : isAr ? 'حفظ ونشر' : 'Save & publish'}
        </button>
        <span className="text-sm text-white/50">
          {dirty ? (isAr ? 'لديك تغييرات غير محفوظة' : 'You have unsaved changes') : isAr ? 'كل التغييرات محفوظة' : 'All changes saved'}
        </span>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      </div>
    </div>
  );
}
