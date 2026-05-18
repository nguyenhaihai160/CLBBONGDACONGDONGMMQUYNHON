/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#0f7b3f',
        grass: '#16a34a',
        limeball: '#d9f99d',
      },
    },
  },
  plugins: [],
};
