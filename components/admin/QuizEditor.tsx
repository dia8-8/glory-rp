'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Save, RotateCcw, ExternalLink, X, CheckCircle2, Search } from 'lucide-react';
import clsx from 'clsx';
import { useLang } from '@/lib/providers';
import { api, PageHeader, SetupNeeded, BiInput, Notice } from './ui';

type Bi = { en: string; ar: string };
type Q = { id: string; q: Bi; options: Bi[]; answer: number; _k?: number };
type Config = { questions: Q[]; size: number; passMark: number };
type Data = { config: Config; source: 'database' | 'default' };

let seq = 1;
const withKeys = (qs: Q[]) => qs.map((q) => ({ ...q, _k: seq++ }));
const LETTERS = 'ABCDEF';

export default function QuizEditor() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [size, setSize] = useState(10);
  const [passMark, setPassMark] = useState(8);
  const [source, setSource] = useState<Data['source']>('default');
  const [setup, setSetup] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function apply(r: { ok: boolean; data: any; error?: string }, okText?: string) {
    if (r.ok) {
      const c: Config = r.data.config;
      setQuestions(withKeys(c.questions));
      setSize(c.size);
      setPassMark(c.passMark);
      setSource(r.data.source);
      setDirty(false);
      if (okText) setMsg({ kind: 'ok', text: okText });
    } else if (r.error === 'setup-needed') setSetup(true);
    else setMsg({ kind: 'err', text: r.error || 'Error' });
  }

  useEffect(() => {
    api<Data>('/api/admin/quiz').then((r) => apply(r));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const touch = () => setDirty(true);
  const update = (i: number, patch: Partial<Q>) => {
    setQuestions((qs) => qs!.map((q, j) => (j === i ? { ...q, ...patch } : q)));
    touch();
  };
  const move = (i: number, d: -1 | 1) => {
    setQuestions((qs) => {
      const a = [...qs!];
      const j = i + d;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
    touch();
  };
  const remove = (i: number) => {
    if (!confirm(isAr ? 'حذف هذا السؤال؟' : 'Delete this question?')) return;
    setQuestions((qs) => qs!.filter((_, j) => j !== i));
    touch();
  };
  const add = () => {
    setQuestions((qs) => [
      ...qs!,
      { id: '', q: { en: '', ar: '' }, options: [{ en: '', ar: '' }, { en: '', ar: '' }, { en: '', ar: '' }, { en: '', ar: '' }], answer: 0, _k: seq++ },
    ]);
    setFilter('');
    touch();
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  };

  async function save() {
    if (!questions) return;
    setBusy(true);
    setMsg(null);
    const payload = { size, passMark, questions: questions.map(({ _k, ...q }) => q) };
    const r = await api('/api/admin/quiz', { method: 'PUT', body: JSON.stringify(payload) });
    setBusy(false);
    apply(r, isAr ? 'تم الحفظ — الاختبار الجديد يعمل الآن.' : 'Saved — the new quiz is live.');
  }

  async function reset() {
    if (!confirm(isAr ? 'الرجوع لأسئلة الاختبار الأصلية؟ ستفقد تعديلاتك.' : 'Go back to the original quiz? Your changes will be lost.')) return;
    setBusy(true);
    apply(await api('/api/admin/quiz', { method: 'DELETE' }), isAr ? 'تمت استعادة الأسئلة الأصلية.' : 'Original questions restored.');
    setBusy(false);
  }

  const shown = useMemo(() => {
    if (!questions) return [];
    const f = filter.trim().toLowerCase();
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => !f || [q.q.en, q.q.ar, ...q.options.flatMap((o) => [o.en, o.ar])].some((t) => t.toLowerCase().includes(f)));
  }, [questions, filter]);

  if (setup) return <SetupNeeded isAr={isAr} />;
  if (!questions) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />;

  const maxSize = Math.min(30, questions.length);

  return (
    <div>
      <PageHeader
        title={isAr ? 'اختبار القوانين' : 'Rules quiz'}
        subtitle={
          isAr
            ? 'الأسئلة التي يجيب عليها اللاعب قبل مقابلة الانضمام. في كل محاولة تُختار أسئلة عشوائية من هذه القائمة.'
            : 'Questions players answer before the join interview. Each attempt picks random questions from this list.'
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

      {/* Settings */}
      <div className="card mb-6 grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'عدد الأسئلة في القائمة' : 'Questions in the list'}</span>
          <p className="mt-1 text-2xl font-extrabold text-brand">{questions.length}</p>
        </div>
        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'أسئلة في كل محاولة' : 'Questions per attempt'}</span>
          <input
            type="number" dir="ltr" min={1} max={maxSize} value={size}
            onChange={(e) => { const v = Number(e.target.value); setSize(v); if (passMark > v) setPassMark(v); touch(); }}
            className="field mt-1"
          />
          <span className="mt-1 block text-xs text-white/40">{isAr ? `من 1 إلى ${maxSize}` : `1 to ${maxSize}`}</span>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{isAr ? 'إجابات صحيحة للنجاح' : 'Correct answers to pass'}</span>
          <input
            type="number" dir="ltr" min={1} max={size} value={passMark}
            onChange={(e) => { setPassMark(Number(e.target.value)); touch(); }}
            className="field mt-1"
          />
          <span className="mt-1 block text-xs text-white/40">
            {isAr ? `${passMark} من ${size}` : `${passMark} out of ${size}`}
            {size > 0 && ` (${Math.round((passMark / size) * 100)}%)`}
          </span>
        </label>
      </div>

      {source === 'default' && (
        <p className="mb-4 text-sm text-white/50">
          {isAr ? 'تعرض الآن الأسئلة الأصلية. عدّلها واضغط حفظ لنشر نسختك.' : 'Showing the original questions. Edit them and press Save to publish your version.'}
        </p>
      )}

      {questions.length > 6 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder={isAr ? 'ابحث في الأسئلة' : 'Search questions'}
            className="field mt-0 ps-9 text-sm"
          />
        </div>
      )}

      <ol className="space-y-4">
        {shown.map(({ q, i }) => (
          <li key={q._k} className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/15 text-sm font-bold text-brand">{i + 1}</span>
              <div className="ms-auto flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0 || !!filter} className="btn btn-ghost h-8 w-8 p-0" title={isAr ? 'لأعلى' : 'Move up'}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === questions.length - 1 || !!filter} className="btn btn-ghost h-8 w-8 p-0" title={isAr ? 'لأسفل' : 'Move down'}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => remove(i)} className="btn h-8 w-8 border border-red-400/40 bg-red-400/10 p-0 text-red-300 hover:bg-red-400/20" title={isAr ? 'حذف' : 'Delete'}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <BiInput
              label={isAr ? 'السؤال' : 'Question'}
              en={q.q.en} ar={q.q.ar} max={300}
              onEn={(v) => update(i, { q: { ...q.q, en: v } })} onAr={(v) => update(i, { q: { ...q.q, ar: v } })}
            />

            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                {isAr ? 'الإجابات — اختر الصحيحة' : 'Answers — pick the correct one'}
              </span>
              <ul className="mt-1 space-y-2" role="radiogroup">
                {q.options.map((o, oi) => {
                  const correct = q.answer === oi;
                  return (
                    <li key={oi} className={clsx('flex items-center gap-2 rounded-xl border p-2', correct ? 'border-brand/50 bg-brand/[0.07]' : 'border-white/[0.06]')}>
                      <button
                        role="radio"
                        aria-checked={correct}
                        onClick={() => update(i, { answer: oi })}
                        title={isAr ? 'الإجابة الصحيحة' : 'Correct answer'}
                        className={clsx('grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold transition', correct ? 'bg-brand text-ink' : 'bg-white/5 text-white/50 hover:bg-white/10')}
                      >
                        {correct ? <CheckCircle2 className="h-5 w-5" /> : LETTERS[oi]}
                      </button>
                      <input dir="ltr" className="field mt-0 text-sm" placeholder="English" value={o.en} maxLength={200}
                        onChange={(e) => update(i, { options: q.options.map((x, j) => (j === oi ? { ...x, en: e.target.value } : x)) })} />
                      <input dir="rtl" className="field mt-0 text-sm" placeholder="عربي" value={o.ar} maxLength={200}
                        onChange={(e) => update(i, { options: q.options.map((x, j) => (j === oi ? { ...x, ar: e.target.value } : x)) })} />
                      <button
                        onClick={() => {
                          const options = q.options.filter((_, j) => j !== oi);
                          // keep the same correct answer after removing another option
                          const answer = q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer;
                          update(i, { options, answer });
                        }}
                        disabled={q.options.length <= 2}
                        className="btn btn-ghost h-9 w-9 shrink-0 p-0" title={isAr ? 'حذف الإجابة' : 'Remove answer'}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {q.options.length < 6 && (
                <button onClick={() => update(i, { options: [...q.options, { en: '', ar: '' }] })} className="btn btn-ghost mt-2 h-8 px-3 text-xs">
                  <Plus className="h-3.5 w-3.5" /> {isAr ? 'إضافة إجابة' : 'Add answer'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {filter && shown.length === 0 && <p className="card p-8 text-center text-white/50">{isAr ? 'لا توجد نتائج.' : 'No matching questions.'}</p>}

      <button onClick={add} className="btn btn-outline mt-4 w-full border-dashed">
        <Plus className="h-4 w-4" /> {isAr ? 'إضافة سؤال' : 'Add question'}
      </button>

      {/* Sticky save bar */}
      <div className={clsx('sticky bottom-20 z-30 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-surface/95 p-3 backdrop-blur lg:bottom-4', dirty ? 'border-brand/40' : 'border-white/10')}>
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
