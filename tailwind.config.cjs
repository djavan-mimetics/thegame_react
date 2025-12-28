/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#120516',
          card: '#1e0b24',
          primary: '#E91E63',
          secondary: '#D81B60',
          accent: '#9C27B0'
        }
      }
    }
  },
  plugins: []
};
