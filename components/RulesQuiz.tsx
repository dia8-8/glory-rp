'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, GraduationCap } from 'lucide-react';
import { useLang } from '@/lib/providers';

type Bi = { en: string; ar: string };
type Q = { id: string; q: Bi; options: Bi[] };
type Result = { score: number; total: number; passed: boolean; wrong: string[] };

export default function RulesQuiz() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const tr = (b: Bi) => (isAr ? b.ar : b.en);
  const router = useRouter();

  const [questions, setQuestions] = useState<Q[]>([]);
  const [passMark, setPassMark] = useState(8);
  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [waitMs, setWaitMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function load() {
    setBusy(true);
    const j = await fetch('/api/quiz').then((r) => r.json()).catch(() => null);
    setBusy(false);
    if (!j || !Array.isArray(j.questions)) {
      if (j?.passed) return router.refresh();
      return setLoadError(true);
    }
    setLoadError(false);
    setQuestions(j.questions);
    setPassMark(j.passMark);
    setWaitMs(j.waitMs || 0);
    setAnswers({});
    setResult(null);
    setStep(-1);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown for retry wait
  useEffect(() => {
    if (waitMs <= 0) return;
    const t = setInterval(() => setWaitMs((w) => Math.max(0, w - 1000)), 1000);
    return () => clearInterval(t);
  }, [waitMs]);

  async function submit() {
    setBusy(true);
    const r = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.status === 429) return setWaitMs(j.waitMs || 120000);
    setResult(j);
    if (!j.passed) setWaitMs(120000);
  }

  const total = questions.length;
  const current = questions[step];
  const Next = isAr ? ArrowLeft : ArrowRight;
  const mmss = `${Math.floor(waitMs / 60000)}:${String(Math.ceil((waitMs % 60000) / 1000) % 60).padStart(2, '0')}`;

  if (loadError) {
    return (
      <div className="card p-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-red-300" />
        <p className="mt-3 text-white/70">
          {isAr ? 'تعذر تحميل الاختبار. سجّل الدخول مرة أخرى ثم حاول.' : 'Couldn’t load the quiz. Sign in again and retry.'}
        </p>
        <button onClick={load} className="btn btn-primary mt-5">
          <RotateCcw className="h-4 w-4" /> {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  /* ───── Result ───── */
  if (result) {
    return (
      <div className="card p-8 text-center sm:p-10">
        {result.passed ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
        ) : (
          <XCircle className="mx-auto h-14 w-14 text-red-300" />
        )}
        <p className="mt-4 text-5xl font-black tabular-nums" dir="ltr">
          <span className={result.passed ? 'text-brand' : 'text-red-300'}>{result.score}</span>
          <span className="text-white/30">/{result.total}</span>
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          {result.passed ? (isAr ? 'أحسنت! نجحت في الاختبار' : 'Well done — you passed!') : isAr ? 'لم تنجح هذه المرة' : 'Not this time'}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-white/60">
          {result.passed
            ? isAr ? 'يمكنك الآن تعبئة مقابلة الانضمام.' : 'You can now fill in the join interview.'
            : isAr
              ? `تحتاج ${passMark} إجابات صحيحة. راجع القوانين ثم حاول مجددًا.`
              : `You need ${passMark} correct answers. Review the rules and try again.`}
        </p>
        {!result.passed && result.wrong.length > 0 && (
          <div className="mx-auto mt-6 max-w-md text-start">
            <p className="mb-2 text-sm font-semibold text-white/70">{isAr ? 'أسئلة أخطأت فيها:' : 'Questions you missed:'}</p>
            <ul className="space-y-1.5 text-sm text-white/60">
              {questions.filter((q) => result.wrong.includes(q.id)).map((q) => (
                <li key={q.id} className="flex gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" /> {tr(q.q)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {result.passed ? (
            <button onClick={() => router.refresh()} className="btn btn-primary">
              {isAr ? 'متابعة للمقابلة' : 'Continue to interview'} <Next className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Link href="/rules" target="_blank" className="btn btn-ghost">
                <BookOpen className="h-4 w-4" /> {isAr ? 'القوانين' : 'Read the rules'}
              </Link>
              <button onClick={load} disabled={waitMs > 0 || busy} className="btn btn-primary">
                <RotateCcw className="h-4 w-4" />
                {waitMs > 0 ? (isAr ? `حاول بعد ${mmss}` : `Retry in ${mmss}`) : isAr ? 'حاول مجددًا' : 'Try again'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ───── Intro ───── */
  if (step === -1) {
    return (
      <div className="card p-8 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/30">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold">{isAr ? 'اختبار القوانين' : 'Rules Quiz'}</h2>
        <p className="mx-auto mt-2 max-w-md text-white/65">
          {isAr
            ? `قبل المقابلة، أجب على ${total || 10} أسئلة عن قوانين السيرفر. تحتاج ${passMark} إجابات صحيحة للنجاح.`
            : `Before the interview, answer ${total || 10} questions about the server rules. You need ${passMark} correct to pass.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/rules" target="_blank" className="btn btn-ghost">
            <BookOpen className="h-4 w-4" /> {isAr ? 'راجع القوانين' : 'Review the rules'}
          </Link>
          <button onClick={() => setStep(0)} disabled={!total || waitMs > 0} className="btn btn-primary">
            {waitMs > 0 ? (isAr ? `انتظر ${mmss}` : `Wait ${mmss}`) : isAr ? 'ابدأ الاختبار' : 'Start the quiz'} <Next className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ───── Question ───── */
  const chosen = answers[current.id];
  const isLast = step === total - 1;
  return (
    <div className="card overflow-hidden">
      <div className="h-1 bg-white/5">
        <div className="h-full bg-brand transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-sm font-medium text-brand">
          {isAr ? `السؤال ${step + 1} من ${total}` : `Question ${step + 1} of ${total}`}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: isAr ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? 16 : -16 }}
            transition={{ duration: 0.18 }}
          >
            <h2 className="mt-2 text-xl font-bold leading-snug">{tr(current.q)}</h2>
            <div className="mt-6 space-y-3" role="radiogroup">
              {current.options.map((o, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={chosen === i}
                  onClick={() => setAnswers((a) => ({ ...a, [current.id]: i }))}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl border p-4 text-start transition',
                    chosen === i ? 'border-brand bg-brand/10 text-white' : 'border-white/10 bg-ink/40 text-white/80 hover:border-white/25'
                  )}
                >
                  <span
                    className={clsx(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold',
                      chosen === i ? 'bg-brand text-ink' : 'bg-white/5 text-white/50'
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {tr(o)}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="btn btn-ghost">
            {isAr ? 'السابق' : 'Back'}
          </button>
          {isLast ? (
            <button onClick={submit} disabled={chosen === undefined || busy} className="btn btn-primary">
              {busy ? '…' : isAr ? 'إرسال الإجابات' : 'Submit answers'}
            </button>
          ) : (
            <button onClick={() => setStep((s) => s + 1)} disabled={chosen === undefined} className="btn btn-primary">
              {isAr ? 'التالي' : 'Next'} <Next className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
