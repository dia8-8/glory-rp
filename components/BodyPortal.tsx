'use client';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children directly in <body>, outside page wrappers that create their own layer
 * (z-index / transform), so drawers and full-screen viewers always sit above the navbar.
 */
export default function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
