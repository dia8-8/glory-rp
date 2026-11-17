'use client';
import { useInView } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

function useCountUp(target: number, run: boolean, duration = 1.4) {
  const [value, set] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      set(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, run]);
  return value;
}

export default function Stat({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const num = Number(String(value).replace(/\D/g, '')) || 0;
  const count = useCountUp(num, inView);

  return (
    <div ref={ref} className="card card-hover group overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl transition group-hover:bg-brand/20" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="text-5xl font-extrabold tracking-tight text-gradient tabular-nums" dir="ltr">
            {new Intl.NumberFormat('en-US').format(count)}+
          </div>
          <div className="mt-2 text-sm font-medium uppercase tracking-wider text-white/50">{label}</div>
        </div>
        {icon && <div className="icon-tile ring-0">{icon}</div>}
      </div>
    </div>
  );
}
