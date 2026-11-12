/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#10133F',
        purple: '#7100C8',
        pink: '#BF006D',
        pinkdark: '#BF006D',
        orange: '#FF6B22',
        cream: '#FFF8F0',
        mint: '#087F78',
        ink: '#58596E',
        copy: '#161A3D',
        lavender: '#F1E7FF',
        lavenderstrong: '#DDC2FF',
        teal: '#087F78',
        line: '#DDD6E7',
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
