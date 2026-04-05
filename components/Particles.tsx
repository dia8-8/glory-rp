'use client';
import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  quantity?: number;
  color?: string;
  size?: [number, number];
  speed?: [number, number];
  linkDistance?: number;
  opacity?: number;
};

export default function Particles({
  className,
  quantity = 60,
  color = '#6c2de4',
  size = [1.2, 2.6],
  speed = [0.08, 0.28],
  linkDistance = 90,
  opacity = 0.9,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let cssW = 0, cssH = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let points: P[] = [];

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const hexToRgba = (hex: string, a: number) => {
      if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
      const h = hex.replace('#', '');
      const v = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    function resizeTo(el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      points = Array.from({ length: quantity }).map(() => ({
        x: Math.random() * cssW,
        y: Math.random() * cssH,
        vx: rand(speed[0], speed[1]) * (Math.random() < 0.5 ? -1 : 1),
        vy: rand(speed[0], speed[1]) * (Math.random() < 0.5 ? -1 : 1),
        r: rand(size[0], size[1]),
      }));
    }

    function step() {
      ctx.clearRect(0, 0, cssW, cssH);

      // links
      if (linkDistance > 0) {
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < linkDistance) {
              const a = (1 - dist / linkDistance) * 0.35 * opacity;
              ctx.strokeStyle = hexToRgba(color, a);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // dots + motion with wrap
      for (const p of points) {
        ctx.fillStyle = hexToRgba(color, opacity);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = cssW + 10;
        if (p.x > cssW + 10) p.x = -10;
        if (p.y < -10) p.y = cssH + 10;
        if (p.y > cssH + 10) p.y = -10;
      }

      raf = requestAnimationFrame(step);
    }

    // Size to the section (parent element)
    const parent = canvas.parentElement || document.body;
    const ro = new ResizeObserver(() => {
      resizeTo(parent);
      init();
    });
    ro.observe(parent);

    // Kick off after first layout
    resizeTo(parent);
    init();

    if (!prefersReduce) {
      raf = requestAnimationFrame(step);
    } else {
      // static field for reduced motion
      for (const p of points) {
        ctx.fillStyle = hexToRgba(color, opacity);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [quantity, color, size[0], size[1], speed[0], speed[1], linkDistance, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={['pointer-events-none absolute inset-0 w-full h-full', className].filter(Boolean).join(' ')}
      aria-hidden
    />
  );
}
