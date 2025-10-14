'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

export default function Reveal({
  children,
  className = '',
  delay = 0,
  distance = 18, 
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const inView = useInView(ref, {
    margin: '-10% 0px -10% 0px',
    amount: 0.2,
    once: false,
  });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: distance }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
        transition={{ duration, ease: 'easeOut', delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
