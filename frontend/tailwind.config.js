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
          gold: '#F6BA38',
          goldHover: '#E5A823',
          goldDark: '#D97706',
          footerBg: '#011844',
          footerGold: '#D3B62A',
          tableHead: '#EEF4FB',
          logoutRed: '#ED080B',
          surface: '#F8FAFC',
          textDark: '#1E293B',
          textMuted: '#64748B'
        }
      }
    },
  },
  plugins: [],
};
