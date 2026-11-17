'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const FALLBACK = '/logo.png';

/** Streamer avatar that falls back to the server logo when the remote image fails (e.g. hotlink-blocked). */
export default function Avatar({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // The image may have already failed before hydration attached onError
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <img
      ref={ref}
      src={failed ? FALLBACK : src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={clsx('bg-ink object-cover', failed && 'object-contain p-4', className)}
    />
  );
}
