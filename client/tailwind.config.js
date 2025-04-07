/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#6B7280',
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
    },
  },
  plugins: [],
} 