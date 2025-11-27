/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      colors: {
        phomi: {
          black: '#000000',
          gold: '#C59C6C',
          white: '#FFFFFF',
          gray: {
            900: '#333333',
            500: '#888888',
            400: '#AAAAAA',
            300: '#CCCCCC',
            100: '#E5E5E5',
            50: '#F8F8F8',
          },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
