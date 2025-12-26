/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sumo-paper': '#f5f5f0', // Washi-like off-white
        'sumo-red': '#b33e30',
        'sumo-gold': '#d4af37',
        'sumo-black': '#1a1a1a',
      },
      fontFamily: {
        'serif': ['"Noto Serif JP"', 'serif'], // Mincho style
        'sans': ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
