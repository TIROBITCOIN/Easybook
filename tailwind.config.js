/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f8fafc',
        muted: '#94a3b8',
        panel: '#111827',
        panel2: '#172033',
        line: '#283246',
        accent: '#7dd3fc',
        gold: '#facc15'
      },
      boxShadow: {
        soft: '0 18px 50px rgb(0 0 0 / 25%)'
      }
    }
  },
  plugins: []
};
