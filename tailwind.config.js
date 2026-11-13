/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ── Core surface tokens ──────────────────────────────────────
        canvas:  '#F7F5F0',
        surface: '#FFFFFF',
        ink:     '#171615',
        muted:   '#6B655E',
        brand:   '#C85A32',
        sand:    '#EFECE6',
        border:  '#E2DDD5',

        // ── Semantic quadrant tokens ─────────────────────────────────
        PRIORITAS_UTAMA: {
          text:   '#14532D',
          bg:     '#ECFDF5',
          border: '#86EFAC',
          hex:    '#059669',
        },
        POTENSI: {
          text:   '#1E3A8A',
          bg:     '#EFF6FF',
          border: '#93C5FD',
          hex:    '#2563EB',
        },
        PERTIMBANGKAN: {
          text:   '#78350F',
          bg:     '#FFFBEB',
          border: '#FCD34D',
          hex:    '#D97706',
        },
        TUNDA: {
          text:   '#334155',
          bg:     '#F1F5F9',
          border: '#CBD5E1',
          hex:    '#64748B',
        },
        q1: {
          text:   '#14532D',
          bg:     '#ECFDF5',
          border: '#86EFAC',
          hex:    '#059669',
        },
        q2: {
          text:   '#1E3A8A',
          bg:     '#EFF6FF',
          border: '#93C5FD',
          hex:    '#2563EB',
        },
        q3: {
          text:   '#78350F',
          bg:     '#FFFBEB',
          border: '#FCD34D',
          hex:    '#D97706',
        },
        q4: {
          text:   '#334155',
          bg:     '#F1F5F9',
          border: '#CBD5E1',
          hex:    '#64748B',
        },
      },
      borderWidth: {
        hairline: '1px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xs': ['0.5rem',   { lineHeight: '0.75rem'  }],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}

