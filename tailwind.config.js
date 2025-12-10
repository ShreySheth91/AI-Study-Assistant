/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        'midnight': '#0f0f1a',
        'slate': '#1a1a2e',
        'accent': '#6366f1',
        'accent-light': '#818cf8',
        'success': '#10b981',
        'warning': '#f59e0b',
      }
    },
  },
  plugins: [],
}
