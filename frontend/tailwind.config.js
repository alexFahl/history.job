/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#ffffff',
        'background': '#070d18',
        'primary': '#3067fd',
        'secondary': '#a3b9ff',
        'accent': '#e496a9',
      }
    },
  },
  plugins: [],
}