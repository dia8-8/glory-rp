/** "5m ago" / "منذ 5د". Only call in the browser (after data loads) to avoid server/client mismatches. */
export function timeAgo(iso: string, isAr: boolean) {
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, number, string, string][] = [
    [60, 1, 's', 'ث'],
    [3600, 60, 'm', 'د'],
    [86400, 3600, 'h', 'س'],
    [2592000, 86400, 'd', 'ي'],
    [31536000, 2592000, 'mo', 'ش'],
    [Infinity, 31536000, 'y', 'سنة'],
  ];
  const [, div, en, ar] = steps.find(([limit]) => sec < limit)!;
  const v = Math.floor(sec / div);
  return isAr ? `منذ ${v}${ar}` : `${v}${en} ago`;
}
