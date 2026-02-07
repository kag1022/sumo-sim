/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sumo-paper': '#fcf9f2',
        'sumo-red': '#b7282e',
        'sumo-gold': '#fbbf24',
        'sumo-ink': '#1e293b',
        'sumo-line': '#e6dfcf',
      },
      fontFamily: {
        'serif': ['"Noto Serif JP"', 'serif'],
        'sans': ['"Noto Sans JP"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
