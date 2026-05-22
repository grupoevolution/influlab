import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores que mudam entre temas — usam CSS vars (RGB sem vírgulas) para permitir opacity
        bg: {
          DEFAULT: 'rgb(var(--c-bg) / <alpha-value>)',
          surface: 'rgb(var(--c-bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--c-bg-elevated) / <alpha-value>)',
          card: 'rgb(var(--c-bg-card) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--c-border) / <alpha-value>)',
          subtle: 'rgb(var(--c-border-subtle) / <alpha-value>)',
          glow: '#3D2D6B',
        },
        text: {
          primary: 'rgb(var(--c-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--c-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--c-text-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-text-subtle) / <alpha-value>)',
        },

        // Brand colors — fixos em ambos os temas
        brand: {
          violet: {
            50: '#F3EEFF',
            100: '#E4D9FF',
            200: '#C9B5FF',
            300: '#A78BFA',
            400: '#8B5CF6',
            500: '#7C3AED',
            600: '#6B21D8',
            700: '#581CB8',
            800: '#4A1A99',
            900: '#3B1481',
          },
          cyan: {
            50: '#ECFEFF',
            100: '#CFFAFE',
            200: '#A5F3FC',
            300: '#67E8F9',
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
            700: '#0E7490',
          },
          blue: {
            400: '#60A5FA',
            500: '#3B82F6',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #22D3EE 0%, #7C3AED 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(124,58,237,0.15) 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 0% 0%, rgba(124,58,237,0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(34,211,238,0.18) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(139,92,246,0.20) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-violet': '0 0 40px rgba(124,58,237,0.35), 0 0 80px rgba(124,58,237,0.15)',
        'glow-cyan': '0 0 40px rgba(34,211,238,0.35), 0 0 80px rgba(34,211,238,0.15)',
        'glow-brand': '0 0 30px rgba(124,58,237,0.25), 0 0 60px rgba(34,211,238,0.15)',
        'card': '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 48px rgba(124,58,237,0.20)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
