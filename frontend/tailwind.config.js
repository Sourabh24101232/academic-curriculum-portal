/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        institute: {
          navy: '#0B2545',
          navyDark: '#081D35',
          navyLight: '#133E87',
          gold: '#F59E0B',
          goldDark: '#D97706',
          surface: '#F8FAFC',
          textDark: '#1E293B',
          textMuted: '#64748B'
        }
      }
    },
  },
  plugins: [],
};
