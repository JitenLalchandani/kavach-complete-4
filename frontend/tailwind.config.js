/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7F6',
        ink: '#1F2A2A',
        teal: {
          50: '#EAF3F2',
          100: '#CFE3E1',
          300: '#7FA9A6',
          500: '#2D6A67',
          700: '#1B4B4A',
          900: '#102F2E',
        },
        marigold: {
          50: '#FDF3E7',
          100: '#FBE2C0',
          300: '#F0AE68',
          500: '#E08A3C',
          700: '#B8691F',
        },
        alert: {
          DEFAULT: '#C63D3D',
          light: '#F9E1E1',
          dark: '#8F2323',
        },
        safe: {
          DEFAULT: '#3F8F5F',
          light: '#E3F2E8',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['1.125rem', '1.75rem'], // 18px body base — larger than typical default for readability
        lg: ['1.25rem', '1.85rem'],
        xl: ['1.5rem', '2rem'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(27, 75, 74, 0.08)',
        pop: '0 6px 24px rgba(27, 75, 74, 0.16)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
