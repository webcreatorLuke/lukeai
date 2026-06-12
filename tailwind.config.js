/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LukeAI Brand Palette
        void: {
          DEFAULT: '#0a0a0f',
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c0c0ee',
          300: '#9090cc',
          400: '#6060aa',
          500: '#404088',
          600: '#202066',
          700: '#101044',
          800: '#080822',
          900: '#0a0a0f',
          950: '#050508',
        },
        neon: {
          DEFAULT: '#7c3aed',
          cyan:    '#06b6d4',
          purple:  '#7c3aed',
          pink:    '#ec4899',
          green:   '#10b981',
          amber:   '#f59e0b',
        },
        surface: {
          DEFAULT: '#13131a',
          raised:  '#1a1a24',
          overlay: '#21212e',
          border:  '#2a2a3d',
          subtle:  '#1e1e2a',
        },
        text: {
          primary:   '#f0f0ff',
          secondary: '#a0a0c0',
          muted:     '#606080',
          accent:    '#8b5cf6',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-in-out',
        'fade-up':       'fadeUp 0.4s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
        'typing':        'typing 1.4s steps(3, end) infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(124, 58, 237, 0.7)' },
        },
        typing: {
          '0%, 100%': { content: '"."' },
          '33%':      { content: '".."' },
          '66%':      { content: '"..."' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise':           "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'grid-pattern':    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237c3aed' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-sm':  '0 0 10px rgba(124, 58, 237, 0.3)',
        'glow-md':  '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-lg':  '0 0 40px rgba(124, 58, 237, 0.5)',
        'glow-xl':  '0 0 60px rgba(124, 58, 237, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(124, 58, 237, 0.1)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
