/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B0B3B',
        purple: '#7A00FF',
        pink: '#FF008A',
        orange: '#FF6B22',
        cream: '#FFF8F1',
        mint: '#00C5A2',
        ink: '#4A4E72',
      },
      fontFamily: {
        display: ['var(--font-jakarta)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        hand: ['var(--font-caveat)', 'cursive'],
      },
      boxShadow: {
        card: '0 18px 50px rgba(11, 11, 59, 0.12)',
        pill: '0 8px 28px rgba(30, 20, 80, 0.08)',
      },
    },
  },
  plugins: [],
};
