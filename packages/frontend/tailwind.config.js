/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81'
        }
      },
      boxShadow: {
        'soft': '0 2px 6px -1px rgb(0 0 0 / 0.06), 0 1px 3px -1px rgb(0 0 0 / 0.04)'
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease both',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } }
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
};
