/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        comatch: {
          primary: '#3b82f6',
          light: '#93c5fd',
          success: '#4ade80',
          danger: '#f87171',
          background: '#f8fafc',
        }
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      }
    }
  },
  plugins: [],
}