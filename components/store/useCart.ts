'use client';
import { useCallback, useEffect, useState } from 'react';

export type CartItem = { kind: 'product' | 'bundle'; id: string };
const KEY = 'glory_cart';
export const MAX_ITEMS = 20;

function read(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => (x?.kind === 'product' || x?.kind === 'bundle') && typeof x?.id === 'string').slice(0, MAX_ITEMS) : [];
  } catch {
    return []; // private mode / blocked storage → empty cart, still works for this visit
  }
}
function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

/** Cart kept in the browser (survives reloads, synced across tabs). */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setItems(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (cur: CartItem[]) => CartItem[]) => {
    setItems((cur) => {
      const next = fn(cur).slice(0, MAX_ITEMS);
      write(next);
      return next;
    });
  }, []);

  return {
    items,
    ready,
    has: (kind: CartItem['kind'], id: string) => items.some((i) => i.kind === kind && i.id === id),
    add: (item: CartItem, replaces: string[] = []) =>
      update((cur) => [...cur.filter((i) => !(i.kind === 'product' && replaces.includes(i.id)) && !(i.kind === item.kind && i.id === item.id)), item]),
    remove: (kind: CartItem['kind'], id: string) => update((cur) => cur.filter((i) => !(i.kind === kind && i.id === id))),
    clear: () => update(() => []),
  };
}
