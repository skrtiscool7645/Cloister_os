module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#c7d2fe',
          500: '#6366f1',
          700: '#4338ca',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#c7d2fe',
          500: '#6366f1',
          700: '#4338ca',
        },
        accent: {
          50: '#ecfeff',
          300: '#7dd3fc',
          500: '#38bdf8',
          700: '#0ea5e9',
        },
        mint: {
          50: '#effdf4',
          100: '#dcfce7',
          300: '#86efac',
          500: '#22c55e',
          700: '#16a34a',
        },
        neutral: {
          50: '#fafafa',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#64748b',
          700: '#334155',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 2px 6px rgba(15,23,42,0.05)',
        md: '0 10px 25px rgba(15,23,42,0.08)',
        card: '0 16px 40px rgba(15,23,42,0.12)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
        'soft-gradient': 'radial-gradient(circle at top left, rgba(14,165,233,0.16), transparent 26%), radial-gradient(circle at top right, rgba(139,92,246,0.12), transparent 18%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
