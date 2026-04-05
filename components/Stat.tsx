'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function useCountUp(target: number, duration = 1.2) {
  const [value, set] = useState(0);
  useEffect(() => {
    let raf: number; const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      set(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function Stat({ label, value }: { label: string; value: string }) {
  const num = Number(String(value).replace(/\D/g, '')) || 0;
  const count = useCountUp(num);
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="card p-6">
      <div className="text-4xl font-extrabold tracking-tight">
        {new Intl.NumberFormat().format(count)}+
      </div>
      <div className="mt-1 text-sm opacity-80">{label}</div>
    </motion.div>
  );
}
