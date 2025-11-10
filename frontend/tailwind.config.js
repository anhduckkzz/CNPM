/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#5C6EF5',
          dark: '#3E4CE0',
          light: '#E6E9FF',
        },
        ink: '#1F1F29',
        slate: {
          50: '#F8FAFC',
          100: '#EEF2FF',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(20, 20, 43, 0.08)',
      },
    },
  },
  plugins: [],
};
