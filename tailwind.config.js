/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#08090A',
        surface: {
          DEFAULT: '#0F1015',
          card: '#14161F',
          border: '#232634',
        },
        brand: {
          orange: '#FF4F00', // Vibrant Tangerine
          indigo: '#4F46E5',
          cyan: '#00F0FF',
          emerald: '#10B981',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
