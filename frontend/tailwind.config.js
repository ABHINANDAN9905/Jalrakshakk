/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aquifer: {
          critical: '#ef4444',
          semiCritical: '#f97316',
          safe: '#0284c7',
          optimal: '#06b6d4',
          recharge: '#10b981',
          groundwater: '#0ea5e9'
        },
        earth: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#846358',
          800: '#5c433b',
          900: '#3d2822'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'water-flow': 'waterFlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        waterFlow: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
