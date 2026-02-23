/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#dbe3ff',
          200: '#b6c7ff',
          300: '#8faaff',
          400: '#6e91ff',
          500: '#4f7aff',
          600: '#2f5de6',
          700: '#2347b4',
          800: '#1a3482',
          900: '#112451',
        },
      },
    },
  },
  plugins: [],
}
