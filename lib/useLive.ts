'use client';
import { useEffect, useMemo, useState } from 'react';
import { STREAMERS } from '@/data/streamers';

let cache: Promise<string[]> | null = null;

/** Streamers list with live ones first, plus a Set of who is live. */
export function useLiveStreamers() {
  const [live, setLive] = useState<Set<string>>(new Set());
  useEffect(() => {
    cache ??= fetch('/api/live')
      .then((r) => (r.ok ? r.json() : { live: [] }))
      .then((j) => j.live as string[])
      .catch(() => []);
    let alive = true;
    cache.then((names) => alive && setLive(new Set(names)));
    return () => {
      alive = false;
    };
  }, []);

  const sorted = useMemo(
    () => [...STREAMERS].sort((a, b) => Number(live.has(b.name)) - Number(live.has(a.name))),
    [live]
  );
  return { streamers: sorted, live };
}
