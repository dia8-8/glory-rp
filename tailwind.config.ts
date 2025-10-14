import type { Config } from 'tailwindcss';
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { from: '#bb00ff', to: '#cf59ed' },
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
        'radial-soft': 'radial-gradient(1200px_600px_at_50%_-200px, transparent 20%, rgba(255,255,255,0.15) 40%, transparent 60%)',
      },
    },
  },
  plugins: [],
};
export default config;
