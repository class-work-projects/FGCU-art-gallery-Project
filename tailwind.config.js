/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dcebff',
          200: '#b9d7ff',
          300: '#89bcff',
          400: '#529bff',
          500: '#2579ff',
          600: '#0d5ee6',
          700: '#0849b4',
          800: '#073d90',
          900: '#0a326f',
          950: '#061e44'
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
