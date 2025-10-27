/***** @type {import('tailwindcss').Config} *****/
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e8edff',
          200: '#cdd8ff',
          300: '#a4b8ff',
          400: '#7690ff',
          500: '#4c68ff',
          600: '#3346e6',
          700: '#2634b4',
          800: '#1e2a8c',
          900: '#1b2673'
        }
      }
    }
  },
  plugins: []
}
