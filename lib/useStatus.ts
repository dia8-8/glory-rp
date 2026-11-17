'use client';
import { useEffect, useState } from 'react';

export type SiteStatus = {
  server: { online: boolean; players: number; max: number } | null;
  discord: { members: number; online: number } | null;
};

let cache: Promise<SiteStatus> | null = null;

/** Shared, de-duplicated fetch of /api/status for every component on the page. */
export function useStatus() {
  const [data, setData] = useState<SiteStatus | null>(null);
  useEffect(() => {
    cache ??= fetch('/api/status')
      .then((r) => (r.ok ? r.json() : { server: null, discord: null }))
      .catch(() => ({ server: null, discord: null }));
    let alive = true;
    cache.then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
