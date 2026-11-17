export default function LiveBadge() {
  return (
    <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ring-2 ring-ink">
      <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle animate-pulse-dot" />
      Live
    </span>
  );
}
