import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy "cockpit" chrome used for the header, hero and footer.
        ink: {
          DEFAULT: '#0B1220',
          50: '#F5F7FA',
          100: '#E7ECF3',
          200: '#CBD5E3',
          300: '#A3B1C6',
          400: '#6E7F99',
          500: '#4A5C78',
          600: '#33445F',
          700: '#22314A',
          800: '#152136',
          900: '#0B1220',
          950: '#060B15',
        },
        // Afterburner orange - the primary action colour.
        flame: {
          DEFAULT: '#FF5A1F',
          50: '#FFF3ED',
          100: '#FFE3D4',
          200: '#FFC3A8',
          300: '#FF9E71',
          400: '#FF7A45',
          500: '#FF5A1F',
          600: '#ED3D02',
          700: '#C42D03',
          800: '#9B260C',
          900: '#7C230D',
        },
        // Sky blue for informational accents and links.
        sky: {
          DEFAULT: '#0EA5E9',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 18, 32, 0.04), 0 8px 24px -12px rgba(11, 18, 32, 0.14)',
        lift: '0 2px 4px rgba(11, 18, 32, 0.05), 0 18px 40px -18px rgba(11, 18, 32, 0.28)',
      },
      backgroundImage: {
        'blueprint-grid':
          'linear-gradient(to right, rgba(125,211,252,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(125,211,252,0.07) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        taxi: {
          from: { transform: 'translateX(-8%)' },
          to: { transform: 'translateX(8%)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        taxi: 'taxi 16s ease-in-out infinite alternate',
        marquee: 'marquee 45s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
