'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] rounded-2xl px-3.5 py-3 shadow-lg ring-1 ring-white/20 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
          aria-label="Back to top"
          title="Back to top"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path fill="currentColor" d="M12 7l7 7-1.41 1.41L12 9.83l-5.59 5.58L5 14z"/>
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
