'use client';
import { motion } from 'framer-motion';

/**
 * Smooth fade between pages (template re-mounts on every navigation).
 * Opacity only: a leftover transform would trap pop-ups (cart drawer, gallery viewer) under the navbar.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-1 flex-col [&>main]:flex-1"
    >
      {children}
    </motion.div>
  );
}
