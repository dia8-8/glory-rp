import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Main accent green (#50f018) — supports opacity modifiers, e.g. bg-brand/10
        brand: {
          DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft-rgb) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
        },
        // Dark UI (#12161c) and elevated surfaces
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          2: 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, rgb(var(--brand-soft-rgb)), rgb(var(--brand-rgb)) 50%, rgb(var(--brand-deep-rgb)))',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--brand-rgb) / 0.35), 0 8px 30px -6px rgb(var(--brand-rgb) / 0.45)',
        'glow-lg': '0 0 0 1px rgb(var(--brand-rgb) / 0.5), 0 12px 48px -8px rgb(var(--brand-rgb) / 0.6)',
      },
      keyframes: {
        shimmer: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(120%)' } },
        'pulse-dot': { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '.4', transform: 'scale(.8)' } },
        'scroll-hint': { '0%': { transform: 'translateY(0)', opacity: '0' }, '30%': { opacity: '1' }, '100%': { transform: 'translateY(10px)', opacity: '0' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'scroll-hint': 'scroll-hint 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
